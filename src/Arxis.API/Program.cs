using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Arxis.Infrastructure.Data;
using Arxis.API.Middleware;
using Arxis.API.Services;
using Arxis.API.Configuration;
using DotNetEnv;

// Load .env file da raiz do projeto (../../.env relativo ao diretório da API)
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (File.Exists(envPath))
{
    Env.Load(envPath);
    Console.WriteLine($"✅ .env carregado de: {envPath}");
}
else
{
    Console.WriteLine($"⚠️  Arquivo .env não encontrado em: {envPath}");
    // Tentar carregar do diretório atual
    Env.Load();
}

// Configurar variáveis de ambiente para que o .NET possa lê-las
// Formato: Seção__SubSeção (dois underscores)
var clarityToken = Environment.GetEnvironmentVariable("CLARITY_API_TOKEN");
var clarityProjectId = Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID");

Console.WriteLine($"CLARITY_API_TOKEN: {(string.IsNullOrEmpty(clarityToken) ? "VAZIO" : clarityToken.Substring(0, Math.Min(20, clarityToken.Length)) + "...")}");
Console.WriteLine($"CLARITY_PROJECT_ID: {(string.IsNullOrEmpty(clarityProjectId) ? "VAZIO" : clarityProjectId)}");

if (!string.IsNullOrEmpty(clarityToken))
    Environment.SetEnvironmentVariable("Clarity__ApiToken", clarityToken);
if (!string.IsNullOrEmpty(clarityProjectId))
    Environment.SetEnvironmentVariable("Clarity__ProjectId", clarityProjectId);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    });

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Register Configuration Services
builder.Services.AddSingleton<ExternalServicesConfig>();

// Register AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Register Email Service (inspired by avx-cell)
builder.Services.AddScoped<IEmailService, EmailService>();

// Register Notification Service (inspired by avx-events pub/sub)
builder.Services.AddScoped<INotificationService, NotificationService>();

// Register Analytics Service
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// Register Dashboard Service
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Register Clarity Service with HttpClient
builder.Services.AddHttpClient<IClarityService, ClarityService>();

// Register File Storage Service
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "ARXIS API",
        Version = "v1",
        Description = "API para gerenciamento de obras - Plataforma ARXIS com autenticação JWT",
        Contact = new()
        {
            Name = "ARXIS Support",
            Email = "support@arxis.com"
        }
    });
});

// Configure Database - SQLite only
builder.Services.AddDbContext<ArxisDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=arxis.db";

    options.UseSqlite(connectionString);

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuaChaveSecretaMuitoSeguraComPeloMenos32Caracteres123456";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ArxisAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ArxisWeb";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ArxisDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ARXIS API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Auto-create database on startup (only for development with SQLite)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArxisDbContext>();
    try
    {
        dbContext.Database.Migrate();
        app.Logger.LogInformation("Database migrated successfully");

        // Debug: Verificar se variáveis do Clarity foram carregadas
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var tokenValue = config["Clarity:ApiToken"];
        var projectIdValue = config["Clarity:ProjectId"];

        if (!string.IsNullOrEmpty(tokenValue))
            app.Logger.LogInformation($"✅ Clarity Token configurado: {tokenValue.Substring(0, Math.Min(20, tokenValue.Length))}...");
        else
            app.Logger.LogWarning("⚠️  Clarity Token NÃO configurado");

        if (!string.IsNullOrEmpty(projectIdValue))
            app.Logger.LogInformation($"✅ Clarity Project ID configurado: {projectIdValue}");
        else
            app.Logger.LogWarning("⚠️  Clarity Project ID NÃO configurado");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while migrating the database");
    }
}

app.Run();


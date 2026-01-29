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
using Arxis.API.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using AspNetCoreRateLimit;
using Serilog;
using Serilog.Events;
using Serilog.Enrichers;
using DotNetEnv;

// Configure Serilog early for startup logging (skip in tests)
if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Testing")
{
    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithProcessId()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/arxis-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}")
        .CreateBootstrapLogger();
}

try
{
    Log.Information("🚀 Starting ARXIS API application");

    // Load .env file da raiz do projeto (../../.env relativo ao diretório da API)
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        Log.Information("✅ .env loaded from: {EnvPath}", envPath);
    }
    else
    {
        Log.Warning("⚠️  .env file not found at: {EnvPath}", envPath);
        Env.Load();
    }

    // Configurar variáveis de ambiente para que o .NET possa lê-las
    var clarityToken = Environment.GetEnvironmentVariable("CLARITY_API_TOKEN");
    var clarityProjectId = Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID");

    if (!string.IsNullOrEmpty(clarityToken))
        Environment.SetEnvironmentVariable("Clarity__ApiToken", clarityToken);
    if (!string.IsNullOrEmpty(clarityProjectId))
        Environment.SetEnvironmentVariable("Clarity__ProjectId", clarityProjectId);

    var builder = WebApplication.CreateBuilder(args);

    // Replace default logging with Serilog
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithProcessId()
        .Enrich.WithEnvironmentName()
        .Enrich.WithProperty("Application", "ArxisAPI")
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/arxis-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] [{SourceContext}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    );

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

// Configure Distributed Cache (Redis or In-Memory fallback)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    Log.Information("🔴 Configuring Redis distributed cache: {RedisConnection}", redisConnection.Split('@').LastOrDefault());
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnection;
        options.InstanceName = "Arxis_";
    });
}
else
{
    Log.Warning("⚠️  Redis not configured, using in-memory cache");
    builder.Services.AddDistributedMemoryCache();
}

// Register Cache Service
builder.Services.AddSingleton<ICacheService, CacheService>();

// Configure Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<AspNetCoreRateLimit.IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.ClientIdHeader = "X-ClientId";
    options.GeneralRules = new List<AspNetCoreRateLimit.RateLimitRule>
    {
        new AspNetCoreRateLimit.RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 60
        },
        new AspNetCoreRateLimit.RateLimitRule
        {
            Endpoint = "*",
            Period = "1h",
            Limit = 1000
        },
        new AspNetCoreRateLimit.RateLimitRule
        {
            Endpoint = "*/auth/*",
            Period = "1m",
            Limit = 10
        }
    };
});
builder.Services.AddSingleton<AspNetCoreRateLimit.IIpPolicyStore, AspNetCoreRateLimit.MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<AspNetCoreRateLimit.IRateLimitCounterStore, AspNetCoreRateLimit.MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<AspNetCoreRateLimit.IRateLimitConfiguration, AspNetCoreRateLimit.RateLimitConfiguration>();
builder.Services.AddSingleton<AspNetCoreRateLimit.IProcessingStrategy, AspNetCoreRateLimit.AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

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

// Configure Database - SQLite for Development, SQL Server for Production
builder.Services.AddDbContext<ArxisDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=arxis.db";

    // Use SQL Server if connection string contains "database.windows.net" (Azure SQL)
    if (connectionString.Contains("database.windows.net", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    }
    else
    {
        options.UseSqlite(connectionString);
    }

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

// Health Checks - Comprehensive monitoring
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("API is running"))
    .AddDbContextCheck<ArxisDbContext>(
        name: "database",
        tags: new[] { "db", "ready" })
    .AddCheck<MemoryHealthCheck>(
        name: "memory",
        tags: new[] { "memory", "performance" })
    .AddCheck<DiskSpaceHealthCheck>(
        name: "diskspace",
        tags: new[] { "disk", "storage" })
    .AddCheck<ExternalServicesHealthCheck>(
        name: "external-services",
        tags: new[] { "external", "dependencies" });

// Register health check dependencies
builder.Services.AddSingleton<MemoryHealthCheck>();
builder.Services.AddSingleton<DiskSpaceHealthCheck>();
builder.Services.AddHttpClient<ExternalServicesHealthCheck>();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();

// Enable Rate Limiting
app.UseIpRateLimiting();

// Enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ARXIS API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health Check Endpoints - Multiple levels
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // Only self-check
});

// Auto-create database on startup (only for development with SQLite)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ArxisDbContext>();
    try
    {
        dbContext.Database.Migrate();
        Log.Information("✅ Database migrated successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "❌ An error occurred while migrating the database");
    }
}

Log.Information("🎉 ARXIS API started successfully on {Environment}", app.Environment.EnvironmentName);
app.Run();
Log.Information("🛑 ARXIS API shut down complete");

}
catch (Exception ex)
{
    Log.Fatal(ex, "❌ Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }


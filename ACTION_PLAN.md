# 🎯 Plano de Ação - ARXIS

## 📋 Checklist Prática

Use este documento como guia passo-a-passo para melhorar o projeto.

---

## 🔥 DIA 1: Correções Críticas (2-3 horas)

### ✅ Tarefa 1.1: Corrigir Warning Decimal (15 min)

**1. Abrir arquivo:**
```
src/Arxis.Infrastructure/Data/ArxisDbContext.cs
```

**2. Localizar:**
```csharp
modelBuilder.Entity<Project>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
    entity.Property(e => e.Currency).HasMaxLength(3);
    entity.HasIndex(e => e.TenantId);
});
```

**3. Adicionar linha:**
```csharp
modelBuilder.Entity<Project>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
    entity.Property(e => e.Currency).HasMaxLength(3);
    entity.Property(e => e.TotalBudget).HasPrecision(18, 2);  // ← ADICIONAR ESTA LINHA
    entity.HasIndex(e => e.TenantId);
});
```

**4. Criar e aplicar migration:**
```bash
dotnet ef migrations add FixDecimalPrecision --project src/Arxis.Infrastructure --startup-project src/Arxis.API
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

**✅ Done!** Warning corrigido.

---

### 🔒 Tarefa 1.2: User Secrets (15 min)

**1. Inicializar User Secrets:**
```bash
cd src/Arxis.API
dotnet user-secrets init
```

**2. Adicionar connection string:**
```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=ArxisDb;User Id=sa;Password=SuaSenhaAqui;TrustServerCertificate=True;"
```

**3. Remover connection string de appsettings.json:**
```json
{
  "ConnectionStrings": {
    // REMOVER ESTA LINHA em produção
  },
  "Logging": {
    ...
  }
}
```

**✅ Done!** Senha segura.

---

### 📝 Tarefa 1.3: Adicionar Validações Básicas (1-2 horas)

**1. Instalar FluentValidation:**
```bash
cd src/Arxis.API
dotnet add package FluentValidation.AspNetCore
```

**2. Criar pasta e arquivo:**
```
src/Arxis.API/Validators/ProjectValidator.cs
```

**3. Criar validador:**
```csharp
using FluentValidation;
using Arxis.Domain.Entities;

namespace Arxis.API.Validators;

public class ProjectValidator : AbstractValidator<Project>
{
    public ProjectValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Moeda é obrigatória")
            .MaximumLength(3).WithMessage("Moeda deve ter no máximo 3 caracteres");

        RuleFor(x => x.TotalBudget)
            .GreaterThan(0).When(x => x.TotalBudget.HasValue)
            .WithMessage("Orçamento deve ser maior que zero");

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate).When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("Data de início deve ser antes da data de término");
    }
}
```

**4. Registrar no Program.cs:**
```csharp
using FluentValidation;
using FluentValidation.AspNetCore;

// Adicionar após AddControllers()
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ProjectValidator>();
```

**5. Testar:**
```bash
dotnet build
dotnet run
```

Tente criar projeto sem nome via Swagger - deve retornar erro 400.

**✅ Done!** Validação implementada.

---

## 🔐 DIA 2-3: Autenticação JWT (8-12 horas)

### 🔑 Tarefa 2.1: Instalar Pacotes (5 min)

```bash
cd src/Arxis.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package BCrypt.Net-Next
```

---

### 👤 Tarefa 2.2: Atualizar User Entity (15 min)

**1. Abrir:**
```
src/Arxis.Domain/Entities/User.cs
```

**2. Adicionar propriedades:**
```csharp
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string? Language { get; set; } = "pt-BR";
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    
    // ← ADICIONAR ESTAS 2 LINHAS
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin, Manager, User, Viewer
    
    // Navigation properties
    public Guid? TenantId { get; set; }
    public ICollection<ProjectUser> ProjectUsers { get; set; } = new List<ProjectUser>();
}
```

**3. Criar migration:**
```bash
dotnet ef migrations add AddUserAuthentication --project src/Arxis.Infrastructure --startup-project src/Arxis.API
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

---

### 🔧 Tarefa 2.3: Criar Auth Service (1 hora)

**1. Criar pasta e arquivos:**
```
src/Arxis.API/Models/LoginRequest.cs
src/Arxis.API/Models/RegisterRequest.cs
src/Arxis.API/Models/AuthResponse.cs
src/Arxis.API/Services/IAuthService.cs
src/Arxis.API/Services/AuthService.cs
```

**2. LoginRequest.cs:**
```csharp
namespace Arxis.API.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

**3. RegisterRequest.cs:**
```csharp
namespace Arxis.API.Models;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
```

**4. AuthResponse.cs:**
```csharp
namespace Arxis.API.Models;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
```

**5. IAuthService.cs:**
```csharp
using Arxis.API.Models;

namespace Arxis.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> Login(LoginRequest request);
    Task<AuthResponse?> Register(RegisterRequest request);
    string GenerateJwtToken(Guid userId, string email, string role);
}
```

**6. AuthService.cs:**
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Arxis.API.Models;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Services;

public class AuthService : IAuthService
{
    private readonly ArxisDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ArxisDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse?> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user.Id, user.Email, user.Role);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role
        };
    }

    public async Task<AuthResponse?> Register(RegisterRequest request)
    {
        // Verificar se email já existe
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user.Id, user.Email, user.Role);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role
        };
    }

    public string GenerateJwtToken(Guid userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

---

### 🎮 Tarefa 2.4: Criar Auth Controller (30 min)

**1. Criar arquivo:**
```
src/Arxis.API/Controllers/AuthController.cs
```

**2. Código:**
```csharp
using Microsoft.AspNetCore.Mvc;
using Arxis.API.Models;
using Arxis.API.Services;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var response = await _authService.Login(request);

        if (response == null)
        {
            _logger.LogWarning("Login failed for email: {Email}", request.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        _logger.LogInformation("Login successful for email: {Email}", request.Email);
        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        var response = await _authService.Register(request);

        if (response == null)
        {
            _logger.LogWarning("Registration failed for email: {Email} - Email already exists", request.Email);
            return BadRequest(new { message = "Email já cadastrado" });
        }

        _logger.LogInformation("Registration successful for email: {Email}", request.Email);
        return Ok(response);
    }
}
```

---

### ⚙️ Tarefa 2.5: Configurar JWT no Program.cs (30 min)

**1. Adicionar usando:**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Arxis.API.Services;
```

**2. Adicionar após `AddDbContext`:**
```csharp
// Registrar AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Configurar JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
```

**3. Adicionar antes de `app.MapControllers()`:**
```csharp
app.UseAuthentication();
app.UseAuthorization();
```

**4. Configurar JWT em User Secrets:**
```bash
dotnet user-secrets set "Jwt:Key" "SuaChaveSecretaMuitoSeguraComPeloMenos32Caracteres123456"
dotnet user-secrets set "Jwt:Issuer" "ArxisAPI"
dotnet user-secrets set "Jwt:Audience" "ArxisWeb"
```

---

### 🔒 Tarefa 2.6: Proteger Controllers (30 min)

**1. Adicionar `[Authorize]` nos controllers:**

```csharp
using Microsoft.AspNetCore.Authorization;

[Authorize]  // ← ADICIONAR ESTA LINHA
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    // ...existing code...
}
```

**2. Fazer o mesmo para:**
- `TasksController.cs`
- `IssuesController.cs`

**3. Permitir acesso anônimo ao auth:**

```csharp
[AllowAnonymous]  // ← AuthController não precisa de auth
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // ...existing code...
}
```

---

### ✅ Tarefa 2.7: Testar (30 min)

**1. Rebuild:**
```bash
dotnet build
dotnet run
```

**2. Abrir Swagger:** http://localhost:5000/swagger

**3. Testar registro:**
```json
POST /api/auth/register
{
  "email": "admin@arxis.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "Arxis"
}
```

**4. Copiar token da resposta**

**5. No Swagger, clicar em "Authorize" e colar token:**
```
Bearer SEU_TOKEN_AQUI
```

**6. Testar criar projeto - deve funcionar!**

**7. Remover token e tentar criar projeto - deve dar 401!**

**✅ Done!** Autenticação funcionando!

---

## 📊 DIA 4-5: Melhorias no Frontend (6-8 horas)

### 🔐 Tarefa 3.1: Implementar Login (2-3 horas)

**Ver arquivo separado:** `FRONTEND_AUTH_GUIDE.md` (criaria se necessário)

**Resumo:**
1. Criar `AuthContext.tsx`
2. Criar `Login.tsx`
3. Criar `ProtectedRoute.tsx`
4. Atualizar `apiService.ts` para usar token
5. Atualizar `App.tsx` com rotas

---

## 📈 SEMANA 2: Performance e Qualidade

### Paginação (4-6 horas)
### Testes Unitários (8-12 horas)
### DTOs e AutoMapper (8-12 horas)

---

## 🎯 Resumo: Ordem de Implementação

```
DIA 1 (2-3h):     ✅ Correções Críticas
  ├─ Decimal Fix         (15min)
  ├─ User Secrets        (15min)
  └─ Validação Básica    (1-2h)

DIA 2-3 (8-12h):  🔐 Autenticação
  ├─ Instalar Pacotes    (5min)
  ├─ Atualizar User      (15min)
  ├─ Auth Service        (1h)
  ├─ Auth Controller     (30min)
  ├─ Config Program.cs   (30min)
  ├─ Proteger APIs       (30min)
  └─ Testes              (30min)

DIA 4-5 (6-8h):   📱 Frontend Auth
  ├─ AuthContext         (1h)
  ├─ Login Component     (2h)
  ├─ Protected Routes    (1h)
  └─ Integração          (2-3h)

SEMANA 2:         📊 Performance
  ├─ Paginação           (4-6h)
  ├─ Filtros             (2-3h)
  └─ Otimizações         (2-3h)

SEMANA 3+:        🚀 Features
  ├─ Dashboard           (8-12h)
  ├─ Upload Files        (6-8h)
  ├─ Notificações        (8-10h)
  └─ Módulos Específicos (variável)
```

---

## ✅ Checklist de Verificação

Após cada dia, marque o que foi concluído:

### DIA 1
- [ ] Warning decimal corrigido
- [ ] User secrets configurado
- [ ] FluentValidation instalado
- [ ] ProjectValidator criado
- [ ] Validação testada no Swagger

### DIA 2-3
- [ ] Pacotes JWT instalados
- [ ] User atualizado com PasswordHash e Role
- [ ] Migration criada e aplicada
- [ ] AuthService implementado
- [ ] AuthController implementado
- [ ] Program.cs configurado com JWT
- [ ] Controllers protegidos com [Authorize]
- [ ] Registro testado
- [ ] Login testado
- [ ] Acesso com token testado
- [ ] Bloqueio sem token testado

### DIA 4-5
- [ ] AuthContext criado
- [ ] Login component criado
- [ ] Protected routes implementadas
- [ ] Token salvo no localStorage
- [ ] Interceptor atualizado
- [ ] Logout implementado
- [ ] UI integrada

---

## 🆘 Se der erro...

### Erro: "JWT Key not configured"
**Solução:** Configurar User Secrets (ver Tarefa 2.5)

### Erro: "Cannot find module BCrypt"
**Solução:** `dotnet add package BCrypt.Net-Next`

### Erro: "401 Unauthorized"
**Solução:** Verificar se token está sendo enviado no header

### Erro: Migration fails
**Solução:** Drop database e recriar
```bash
dotnet ef database drop --force
dotnet ef database update
```

---

## 📞 Precisa de Ajuda?

Consulte:
- `IMPROVEMENTS.md` - Lista completa de melhorias
- `TECHNICAL_ISSUES.md` - Problemas conhecidos
- `EXECUTIVE_SUMMARY.md` - Visão geral do projeto

---

**Última atualização**: 2025-12-22  
**Próxima tarefa:** DIA 1 - Correções Críticas 🚀


# 🐛 Issues Técnicos e Correções - ARXIS

## ⚠️ Issues Identificados

### 1. ⚠️ WARNING: Decimal TotalBudget sem precisão

**Localização:** `src/Arxis.Domain/Entities/Project.cs`

**Problema:**
```
No store type was specified for the decimal property 'TotalBudget' on entity type 'Project'. 
This will cause values to be silently truncated if they do not fit in the default precision and scale.
```

**Impacto:** MÉDIO - Valores grandes podem ser truncados

**Solução:**

```csharp
// Em src/Arxis.Infrastructure/Data/ArxisDbContext.cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ...existing code...
    
    modelBuilder.Entity<Project>(entity =>
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        entity.Property(e => e.Currency).HasMaxLength(3);
        
        // FIX: Adicionar precisão para decimal
        entity.Property(e => e.TotalBudget)
            .HasPrecision(18, 2);  // Até 999,999,999,999,999.99
            
        entity.HasIndex(e => e.TenantId);
    });
}
```

**Passos para aplicar:**
```bash
# 1. Fazer a correção no código
# 2. Criar nova migration
dotnet ef migrations add FixTotalBudgetPrecision --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# 3. Aplicar migration
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

---

### 2. 🔒 Sem Autenticação/Autorização

**Localização:** Toda a API

**Problema:** API está completamente aberta sem nenhuma proteção

**Impacto:** CRÍTICO - Qualquer um pode acessar/modificar dados

**Solução:** Ver seção de Autenticação em `IMPROVEMENTS.md`

---

### 3. ❌ Sem Validação de Entrada

**Localização:** Controllers (ProjectsController, TasksController, IssuesController)

**Problema:** Aceita qualquer dado sem validação

**Exemplos de problemas:**
```csharp
// Pode criar projeto sem nome
var project = new Project { Name = "", TotalBudget = -1000 };

// Pode criar tarefa com data no passado
var task = new WorkTask { DueDate = DateTime.Parse("1900-01-01") };

// Pode criar issue sem título
var issue = new Issue { Title = null };
```

**Impacto:** ALTO - Dados inválidos no banco

**Solução Rápida:**

```csharp
// Em ProjectsController.CreateProject
[HttpPost]
public async Task<ActionResult<Project>> CreateProject(Project project)
{
    // ADICIONAR VALIDAÇÕES
    if (string.IsNullOrWhiteSpace(project.Name))
        return BadRequest("Nome é obrigatório");
    
    if (project.Name.Length > 200)
        return BadRequest("Nome deve ter no máximo 200 caracteres");
    
    if (project.TotalBudget.HasValue && project.TotalBudget <= 0)
        return BadRequest("Orçamento deve ser maior que zero");
    
    // ...rest of code
}
```

**Solução Ideal:** FluentValidation (ver IMPROVEMENTS.md)

---

### 4. 🔄 Circular Reference em JSON

**Localização:** Entities com navigation properties

**Problema:** Possível erro de serialização JSON com referências circulares

**Status:** ✅ **JÁ CORRIGIDO** em Program.cs
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
```

---

### 5. 📊 Sem Paginação

**Localização:** `GetProjects()`, `GetProjectTasks()`, `GetProjectIssues()`

**Problema:** Retorna TODOS os registros sem paginação

**Impacto:** MÉDIO - Performance ruim com muitos dados

**Exemplo do problema:**
```csharp
// Se tiver 10.000 projetos, retorna todos!
[HttpGet]
public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
{
    return await _context.Projects
        .Where(p => !p.IsDeleted)
        .ToListAsync();  // ⚠️ SEM LIMITE!
}
```

**Solução Temporária:**

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<Project>>> GetProjects(
    [FromQuery] int page = 1, 
    [FromQuery] int pageSize = 20)
{
    if (pageSize > 100) pageSize = 100; // Limite máximo
    
    return await _context.Projects
        .Where(p => !p.IsDeleted)
        .OrderByDescending(p => p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
}
```

---

### 6. 🗑️ Soft Delete não implementado completamente

**Localização:** BaseEntity tem `IsDeleted`, mas não há filtro global

**Problema:** Precisa sempre lembrar de filtrar `!IsDeleted`

**Impacto:** BAIXO - Pode mostrar dados deletados por engano

**Solução:**

```csharp
// Em ArxisDbContext.cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    
    // Filtro global para soft delete
    modelBuilder.Entity<Project>().HasQueryFilter(p => !p.IsDeleted);
    modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
    modelBuilder.Entity<WorkTask>().HasQueryFilter(t => !t.IsDeleted);
    modelBuilder.Entity<Issue>().HasQueryFilter(i => !i.IsDeleted);
    
    // ...rest of configuration
}
```

**Benefício:** Não precisa mais fazer `.Where(x => !x.IsDeleted)` em todo lugar

---

### 7. ⏰ Timezone Issues

**Localização:** Uso de `DateTime.UtcNow` vs `DateTime.Now`

**Problema:** Mistura de UTC e local time pode causar confusão

**Impacto:** BAIXO - Datas podem aparecer com horário errado

**Solução Atual:** ✅ Está usando `DateTime.UtcNow` (correto)

**Recomendação:** Sempre usar UTC no backend, converter no frontend

---

### 8. 🔗 N+1 Query Problem

**Localização:** Endpoints que retornam listas com relacionamentos

**Problema:** Múltiplas queries ao banco por falta de `.Include()`

**Exemplo:**
```csharp
// Problema: Faz 1 query para projects + N queries para users
var projects = await _context.Projects.ToListAsync();
// Depois acessa: project.ProjectUsers (mais uma query para cada!)
```

**Status:** ✅ **PARCIALMENTE CORRIGIDO** - Alguns endpoints já usam `.Include()`

**Verificar:** Sempre usar `.Include()` quando precisar de relacionamentos

---

### 9. 🌐 CORS muito permissivo

**Localização:** `src/Arxis.API/Program.cs`

**Problema:** CORS está configurado como `AllowAll`

**Impacto:** MÉDIO-BAIXO - Segurança em produção

**Código Atual:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()  // ⚠️ Permite QUALQUER origem
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});
```

**Solução para Produção:**

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production",
        policy =>
        {
            policy.WithOrigins(
                    "https://arxis.com",
                    "https://www.arxis.com",
                    "https://app.arxis.com"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// No middleware
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");  // Dev
}
else
{
    app.UseCors("Production");  // Prod
}
```

---

### 10. 📝 Falta de Logging

**Localização:** Controllers

**Problema:** Logs básicos, sem contexto suficiente

**Impacto:** BAIXO - Dificulta debug em produção

**Exemplo Atual:**
```csharp
private readonly ILogger<ProjectsController> _logger;
// Mas logger não é usado!
```

**Solução:**

```csharp
[HttpPost]
public async Task<ActionResult<Project>> CreateProject(Project project)
{
    _logger.LogInformation("Creating project: {ProjectName}", project.Name);
    
    try
    {
        project.Id = Guid.NewGuid();
        project.CreatedAt = DateTime.UtcNow;
        
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Project created successfully: {ProjectId}", project.Id);
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating project: {ProjectName}", project.Name);
        throw;
    }
}
```

---

### 11. 🚫 Sem Rate Limiting

**Localização:** Toda API

**Problema:** Sem proteção contra abuse/DDoS

**Impacto:** MÉDIO - Vulnerável a ataques

**Solução:** Ver seção de Rate Limiting em `IMPROVEMENTS.md`

---

### 12. 📦 Sem Versionamento de API

**Localização:** API não versionada

**Problema:** Breaking changes afetam todos os clientes

**Impacto:** BAIXO (por enquanto) - Importante para futuro

**Exemplo de rota atual:** `/api/projects`

**Exemplo de rota versionada:** `/api/v1/projects`

---

### 13. 🗄️ Connection String hardcoded

**Localização:** `src/Arxis.API/appsettings.json`

**Problema:** Senha do banco em texto plano no código

**Impacto:** CRÍTICO em produção

**Solução:**

```bash
# Usar User Secrets para desenvolvimento
dotnet user-secrets init --project src/Arxis.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=..." --project src/Arxis.API

# Usar variáveis de ambiente em produção
# Docker: via docker-compose.yml
# Azure: via App Settings
# AWS: via Secrets Manager
```

---

### 14. 🔍 Sem Health Check detalhado

**Localização:** `/health` endpoint

**Status:** ✅ Implementado mas básico

**Melhoria:**

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ArxisDbContext>("database")
    .AddCheck("api", () => HealthCheckResult.Healthy("API is running"))
    .AddCheck("disk", () =>
    {
        var drive = new DriveInfo("C");
        var freeSpace = drive.AvailableFreeSpace;
        var totalSpace = drive.TotalSize;
        var percentFree = (freeSpace * 100) / totalSpace;
        
        return percentFree > 10
            ? HealthCheckResult.Healthy($"Disk: {percentFree}% free")
            : HealthCheckResult.Degraded($"Disk: {percentFree}% free");
    });

// Endpoint com detalhes
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration
            }),
            totalDuration = report.TotalDuration
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});
```

---

### 15. 📱 Frontend sem tratamento de erro de API

**Localização:** `src/Arxis.Web/src/components/ProjectList.tsx`

**Problema:** Apenas mostra "Erro ao carregar projetos"

**Solução:**

```typescript
const loadProjects = async () => {
  try {
    setLoading(true);
    const data = await projectService.getAll();
    setProjects(data);
    setError(null);
  } catch (err) {
    // Melhor tratamento de erro
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        setError('Você precisa fazer login');
      } else if (err.response?.status === 403) {
        setError('Você não tem permissão para acessar projetos');
      } else if (err.response?.status === 500) {
        setError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar projetos');
      }
    } else {
      setError('Erro de conexão. Verifique sua internet.');
    }
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 Checklist de Correções

### 🔴 Crítico (Corrigir AGORA)
- [ ] Implementar autenticação básica
- [ ] Adicionar validação de inputs
- [ ] Usar User Secrets para connection string
- [ ] Corrigir precisão do decimal TotalBudget

### 🟡 Importante (Corrigir em Breve)
- [ ] Implementar paginação
- [ ] Adicionar filtro global para soft delete
- [ ] Melhorar tratamento de erros no frontend
- [ ] Configurar CORS apropriadamente
- [ ] Adicionar logging estruturado

### 🟢 Melhorias (Pode Esperar)
- [ ] Rate limiting
- [ ] API versioning
- [ ] Health check detalhado
- [ ] Otimizar queries N+1

---

## 🚀 Script de Correção Rápida

Execute este script para aplicar correções básicas:

```bash
# 1. Corrigir decimal precision
# Editar ArxisDbContext.cs manualmente (ver correção #1)

# 2. Criar nova migration
dotnet ef migrations add FixDecimalPrecision --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# 3. Aplicar migration
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# 4. Configurar User Secrets
cd src/Arxis.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=ArxisDb;User Id=sa;Password=SuaSenhaAqui;TrustServerCertificate=True;"

# 5. Adicionar FluentValidation
dotnet add package FluentValidation.AspNetCore

# 6. Rebuild
dotnet build
```

---

**Última atualização**: 2025-12-22

**Próximo passo sugerido:** Começar pelas correções CRÍTICAS! 🔴


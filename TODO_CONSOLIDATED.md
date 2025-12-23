# 🚀 TODO LIST Consolidado - ARXIS Project

## 📊 Status Geral

| Categoria | Progresso | Prioridade |
|-----------|-----------|------------|
| **Fundação** | 100% ✅ | - |
| **Segurança** | 0% ❌ | 🔴 CRÍTICO |
| **CI/CD** | 50% ⏳ | 🟡 ALTO |
| **Azure Setup** | 0% ❌ | 🟡 ALTO |
| **Testes** | 0% ❌ | 🟡 MÉDIO |
| **Features** | 20% ⏳ | 🟢 BAIXO |

---

## 🔴 CRÍTICO - Fazer AGORA

### 1. Segurança e Autenticação

- [ ] **Implementar JWT Authentication**
  - [ ] Instalar pacotes necessários
  - [ ] Criar AuthService
  - [ ] Criar AuthController
  - [ ] Atualizar User entity com PasswordHash
  - [ ] Configurar JWT no Program.cs
  - [ ] Proteger controllers com [Authorize]
  - [ ] Criar migration para User auth
  - **Documentação:** `ACTION_PLAN.md` → DIA 2-3
  - **Tempo estimado:** 8-12 horas

- [ ] **User Secrets**
  - [ ] Configurar user secrets localmente
  - [ ] Remover connection string do appsettings.json
  - **Comando:** `dotnet user-secrets init`
  - **Tempo estimado:** 15 minutos

- [ ] **Validação de Dados**
  - [ ] Instalar FluentValidation
  - [ ] Criar ProjectValidator
  - [ ] Criar TaskValidator
  - [ ] Criar IssueValidator
  - [ ] Registrar validadores no Program.cs
  - **Documentação:** `ACTION_PLAN.md` → Tarefa 1.3
  - **Tempo estimado:** 2-3 horas

### 2. Correções Técnicas

- [ ] **Corrigir Warning Decimal**
  - [ ] Atualizar ArxisDbContext.cs
  - [ ] Adicionar `.HasPrecision(18, 2)` em TotalBudget
  - [ ] Criar migration FixDecimalPrecision
  - [ ] Aplicar migration
  - **Documentação:** `TECHNICAL_ISSUES.md` → Issue #1
  - **Tempo estimado:** 30 minutos

---

## 🟡 ALTO - Fazer Esta Semana

### 3. Azure Setup e CI/CD

#### 3.1. Configurar Recursos Azure

- [ ] **Criar Resource Group**
  ```bash
  az group create --name arxis-rg --location eastus
  ```

- [ ] **Criar App Service Plan**
  ```bash
  az appservice plan create --name arxis-plan --resource-group arxis-rg --sku B1
  ```

- [ ] **Criar Web App para API**
  ```bash
  az webapp create --name arxis-api --resource-group arxis-rg --plan arxis-plan --runtime "DOTNETCORE:10.0"
  ```

- [ ] **Criar Static Web App para Frontend**
  ```bash
  az staticwebapp create --name arxis-web --resource-group arxis-rg --location eastus
  ```

- [ ] **Criar Azure SQL**
  - [ ] Criar SQL Server
  - [ ] Criar Database
  - [ ] Configurar firewall rules
  - [ ] Obter connection string

- [ ] **Criar Service Principal**
  ```bash
  az ad sp create-for-rbac --name "arxis-github-actions" --role contributor --scopes /subscriptions/{id}/resourceGroups/arxis-rg --json-auth
  ```

**Documentação:** `.github/SETUP_SECRETS.md`  
**Script automatizado:** Executar `azure-setup.ps1` ou `azure-setup.sh`  
**Tempo estimado:** 2-3 horas

#### 3.2. Configurar GitHub Secrets

- [ ] **Azure Authentication**
  - [ ] AZURE_CLIENT_ID
  - [ ] AZURE_TENANT_ID
  - [ ] AZURE_SUBSCRIPTION_ID

- [ ] **Database**
  - [ ] AZURE_SQL_CONNECTION_STRING

- [ ] **Static Web App**
  - [ ] AZURE_STATIC_WEB_APPS_API_TOKEN

- [ ] **Environment Variables**
  - [ ] VITE_API_URL (production)

**Como fazer:**
```bash
# Via GitHub CLI
gh secret set AZURE_CLIENT_ID
gh secret set AZURE_TENANT_ID
gh secret set AZURE_SUBSCRIPTION_ID
# etc...
```

**Documentação:** `.github/SETUP_SECRETS.md`  
**Tempo estimado:** 30 minutos

#### 3.3. Testar Workflows

- [ ] **CI Build**
  - [ ] Testar build do backend
  - [ ] Testar build do frontend
  - [ ] Testar Docker build
  - [ ] Verificar security scan

- [ ] **Backend Deploy**
  - [ ] Fazer push para main
  - [ ] Verificar workflow execution
  - [ ] Testar API no Azure

- [ ] **Frontend Deploy**
  - [ ] Fazer push para main
  - [ ] Verificar Static Web App deploy
  - [ ] Testar frontend no Azure

- [ ] **Database Migration**
  - [ ] Executar workflow manualmente
  - [ ] Verificar migrations aplicadas

**Arquivos:** `.github/workflows/`  
**Tempo estimado:** 2-3 horas

### 4. Frontend - Autenticação

- [ ] **Criar componentes**
  - [ ] AuthContext.tsx
  - [ ] Login.tsx
  - [ ] Register.tsx
  - [ ] ProtectedRoute.tsx

- [ ] **Atualizar serviços**
  - [ ] authService.ts
  - [ ] Interceptor para token em apiService.ts

- [ ] **Configurar rotas**
  - [ ] Instalar react-router-dom
  - [ ] Criar estrutura de rotas
  - [ ] Proteger rotas privadas

**Documentação:** `ACTION_PLAN.md` → DIA 4-5  
**Tempo estimado:** 6-8 horas

---

## 🟡 MÉDIO - Fazer Próxima Semana

### 5. Performance e Paginação

- [ ] **Implementar Paginação**
  - [ ] Criar PagedResult<T> class
  - [ ] Atualizar GetProjects com paginação
  - [ ] Atualizar GetTasks com paginação
  - [ ] Atualizar GetIssues com paginação
  - [ ] Atualizar frontend para usar paginação

- [ ] **Filtros e Ordenação**
  - [ ] Adicionar filtros por status
  - [ ] Adicionar filtros por data
  - [ ] Adicionar busca por texto
  - [ ] Adicionar ordenação customizada

- [ ] **Query Optimization**
  - [ ] Adicionar índices no banco
  - [ ] Implementar filtro global para soft delete
  - [ ] Otimizar queries N+1

**Documentação:** `IMPROVEMENTS.md` → Seção 5  
**Tempo estimado:** 6-8 horas

### 6. Testes Automatizados

- [ ] **Backend - Unit Tests**
  - [ ] Criar projeto Arxis.Tests
  - [ ] Instalar xUnit, Moq, FluentAssertions
  - [ ] Testes para ProjectsController
  - [ ] Testes para TasksController
  - [ ] Testes para IssuesController
  - [ ] Testes para AuthService
  - [ ] Testes para Validators

- [ ] **Frontend - Unit Tests**
  - [ ] Instalar Vitest e Testing Library
  - [ ] Testes para ProjectList component
  - [ ] Testes para services

- [ ] **Integration Tests**
  - [ ] Configurar WebApplicationFactory
  - [ ] Testes de integração para API

**Documentação:** `IMPROVEMENTS.md` → Seção 4  
**Tempo estimado:** 12-16 horas

### 7. DTOs e AutoMapper

- [ ] **Criar DTOs**
  - [ ] ProjectDto, CreateProjectDto, UpdateProjectDto
  - [ ] TaskDto, CreateTaskDto, UpdateTaskDto
  - [ ] IssueDto, CreateIssueDto, UpdateIssueDto
  - [ ] UserDto, RegisterDto, LoginDto

- [ ] **Configurar AutoMapper**
  - [ ] Instalar AutoMapper.Extensions.Microsoft.DependencyInjection
  - [ ] Criar profiles
  - [ ] Atualizar controllers para usar DTOs

**Documentação:** `IMPROVEMENTS.md` → Seção 3  
**Tempo estimado:** 8-10 horas

---

## 🟢 BAIXO - Pode Esperar

### 8. Features e Módulos

- [ ] **Dashboard com KPIs**
  - [ ] Endpoint de estatísticas
  - [ ] Componente Dashboard
  - [ ] Cards de KPIs
  - [ ] Gráficos (Chart.js ou Recharts)

- [ ] **Upload de Arquivos**
  - [ ] Configurar Azure Blob Storage
  - [ ] FileStorageService
  - [ ] FilesController
  - [ ] Componente de upload no frontend

- [ ] **Notificações Real-time**
  - [ ] Configurar SignalR
  - [ ] NotificationHub
  - [ ] Frontend notification service

- [ ] **Módulos Avançados**
  - [ ] Timeline 4D (Gantt)
  - [ ] Model 3D (Visualizador BIM)
  - [ ] Field (Diário de obra)
  - [ ] Costs & Budget

**Documentação:** `IMPROVEMENTS.md` → Seções 6-9  
**Tempo estimado:** Várias semanas

### 9. Infraestrutura Avançada

- [ ] **Logging Estruturado**
  - [ ] Instalar Serilog
  - [ ] Configurar sinks (Console, File, Azure)
  - [ ] Structured logging em todos controllers

- [ ] **Rate Limiting**
  - [ ] Configurar rate limiter
  - [ ] Políticas por endpoint
  - [ ] Rate limit por usuário

- [ ] **API Versioning**
  - [ ] Instalar Microsoft.AspNetCore.Mvc.Versioning
  - [ ] Configurar versionamento
  - [ ] Criar v2 endpoints

- [ ] **Health Checks Detalhados**
  - [ ] Health check do banco
  - [ ] Health check do Blob Storage
  - [ ] Health check de serviços externos
  - [ ] Dashboard de health

**Documentação:** `IMPROVEMENTS.md` → Seção 10  
**Tempo estimado:** 6-8 horas

### 10. DevOps e Qualidade

- [ ] **Branch Protection**
  - [ ] Configurar no GitHub
  - [ ] Exigir pull requests
  - [ ] Exigir code review
  - [ ] Exigir CI passing

- [ ] **Code Quality**
  - [ ] Configurar SonarCloud
  - [ ] Configurar Codecov
  - [ ] Configurar ESLint/Prettier

- [ ] **Monitoramento**
  - [ ] Application Insights
  - [ ] Alertas de erro
  - [ ] Dashboards

**Tempo estimado:** 4-6 horas

---

## 📅 Cronograma Sugerido

### Semana 1: Segurança e CI/CD

**Segunda-feira:**
- [ ] Corrigir warning decimal (30 min)
- [ ] Configurar User Secrets (15 min)
- [ ] Implementar FluentValidation (2-3h)

**Terça a Quinta:**
- [ ] Implementar JWT Authentication (8-12h)

**Sexta-feira:**
- [ ] Setup Azure Resources (2-3h)
- [ ] Configurar GitHub Secrets (30 min)
- [ ] Testar workflows CI/CD (2-3h)

### Semana 2: Frontend Auth e Performance

**Segunda a Terça:**
- [ ] Implementar autenticação no frontend (6-8h)

**Quarta a Sexta:**
- [ ] Implementar paginação (6-8h)
- [ ] DTOs e AutoMapper (8-10h)

### Semana 3: Testes e Qualidade

**Segunda a Sexta:**
- [ ] Testes backend (8-10h)
- [ ] Testes frontend (4-6h)
- [ ] Code quality setup (2-3h)

### Semana 4+: Features

- [ ] Dashboard
- [ ] Upload de arquivos
- [ ] Módulos específicos
- [ ] Melhorias contínuas

---

## ✅ Checklist Rápido - Primeiros Passos

### Hoje (30 minutos)

```bash
# 1. Corrigir decimal warning
# Editar: src/Arxis.Infrastructure/Data/ArxisDbContext.cs
# Adicionar: entity.Property(e => e.TotalBudget).HasPrecision(18, 2);

dotnet ef migrations add FixDecimalPrecision --project src/Arxis.Infrastructure --startup-project src/Arxis.API
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# 2. User Secrets
cd src/Arxis.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=ArxisDb;User Id=sa;Password=SuaSenha;TrustServerCertificate=True;"
```

### Esta Semana (40 horas)

1. **Autenticação JWT** (12h)
2. **Azure Setup** (4h)
3. **CI/CD Testing** (3h)
4. **Frontend Auth** (8h)
5. **Validação** (3h)
6. **Testes básicos** (10h)

---

## 📞 Próxima Ação

**Agora mesmo:**
1. Executar script de correção do decimal (5 min)
2. Configurar User Secrets (5 min)
3. Começar implementação de Auth JWT (hoje)

**Documentos de referência:**
- `ACTION_PLAN.md` - Passo a passo detalhado
- `IMPROVEMENTS.md` - Lista completa de melhorias
- `TECHNICAL_ISSUES.md` - Problemas conhecidos
- `.github/SETUP_SECRETS.md` - Setup Azure e GitHub

---

**Última atualização:** 2025-12-22  
**Status:** ⚠️ Fundação sólida, aguardando implementação de segurança

**🚀 Vamos começar!**


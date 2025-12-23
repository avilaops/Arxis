# Workflow CI/CD - ARXIS

## 📋 Estrutura de Deploy Azure

### Componentes da Solução

```
Azure Resources:
├── Azure Function App (Backend API)
├── Azure Static Web Apps (Frontend React)
├── Azure SQL Database
├── Azure Container Registry (Docker images)
└── Azure Key Vault (Secrets)
```

---

## 🔄 GitHub Actions Workflows

### 1. Backend API - Azure Function App

**Arquivo:** `.github/workflows/azure-function-deploy.yml`

**Estrutura do Projeto para Azure Functions:**
```
src/Arxis.API/ (Converter para Azure Functions)
├── Functions/
│   ├── ProjectsFunctions.cs
│   ├── TasksFunctions.cs
│   └── IssuesFunctions.cs
├── host.json
├── local.settings.json
└── Arxis.API.csproj
```

---

### 2. Frontend - Azure Static Web Apps

**Arquivo:** `.github/workflows/azure-static-web-apps.yml`

---

### 3. Infrastructure - Terraform/Bicep

**Arquivo:** `.github/workflows/infrastructure-deploy.yml`

---

## 📝 Decisão de Arquitetura

### Opção 1: Azure Functions (Serverless)
**Prós:**
- ✅ Escala automática
- ✅ Pay-per-execution
- ✅ Ótimo para APIs REST

**Contras:**
- ❌ Precisa refatorar controllers
- ❌ Cold start
- ❌ Limites de execução

### Opção 2: Azure App Service (Recomendado)
**Prós:**
- ✅ Já funciona com ASP.NET Core
- ✅ Sem refatoração
- ✅ Always-on disponível
- ✅ Melhor para aplicações web

**Contras:**
- ❌ Mais caro que Functions
- ❌ Precisa gerenciar escala

### Opção 3: Azure Container Apps (Moderna)
**Prós:**
- ✅ Usa Docker (já temos)
- ✅ Escala automática
- ✅ Serverless containers
- ✅ Sem refatoração

**Contras:**
- ❌ Mais complexo
- ❌ Relativamente novo

---

## 🎯 Recomendação: Hybrid Approach

### Arquitetura Recomendada

```
Frontend:
└── Azure Static Web Apps
    ├── React Build (npm run build)
    └── CDN Global

Backend API:
└── Azure App Service (Web App)
    ├── ASP.NET Core 10.0
    ├── Auto-scale enabled
    └── Always-on enabled

Database:
└── Azure SQL Database
    ├── Serverless tier (dev)
    └── General Purpose (prod)

Storage:
└── Azure Blob Storage
    ├── Arquivos BIM
    ├── Documentos
    └── Fotos de campo

Functions (Opcional - Tarefas Assíncronas):
└── Azure Functions
    ├── ProcessBIMFile
    ├── GenerateReports
    └── SendNotifications
```

---

## 📂 Estrutura de Arquivos Necessária

### Criar pastas:

```bash
mkdir -p .github/workflows
mkdir -p infrastructure/bicep
mkdir -p infrastructure/terraform
mkdir -p scripts
```

### Arquivos a criar:

1. `.github/workflows/backend-deploy.yml`
2. `.github/workflows/frontend-deploy.yml`
3. `.github/workflows/database-migrate.yml`
4. `.github/workflows/ci-build.yml`
5. `infrastructure/bicep/main.bicep`
6. `scripts/deploy.ps1`

---

## 🔧 Próximos Passos

### DECISÃO NECESSÁRIA:

**Você quer:**

**A) Azure Functions (Serverless API)**
- Precisa refatorar controllers para functions
- Mais barato para baixo volume
- Melhor para microservices

**B) Azure App Service (Web App) - RECOMENDADO**
- Funciona direto com código atual
- Mais fácil de migrar
- Melhor para APIs REST tradicionais

**C) Azure Container Apps**
- Usa Docker (já temos)
- Serverless containers
- Mais moderno

---

Qual opção você prefere? Vou criar os workflows completos baseado na sua escolha.

Por enquanto, vou criar um workflow **híbrido** que funciona para todas as opções.


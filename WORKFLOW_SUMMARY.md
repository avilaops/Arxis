# ✅ Workflow e CI/CD Organizados - ARXIS

## 🎉 Resumo do que foi criado

### 📦 Arquivos Novos

#### 1. GitHub Actions Workflows (`.github/workflows/`)

| Arquivo | Propósito | Trigger |
|---------|-----------|---------|
| **backend-deploy.yml** | Deploy da API para Azure App Service | Push em `/src/Arxis.API/**` ou manual |
| **frontend-deploy.yml** | Deploy do React para Azure Static Web Apps | Push em `/src/Arxis.Web/**` ou PR |
| **ci-build.yml** | Build, tests e security scan | Push/PR em main/develop |
| **database-migrate.yml** | Aplica migrations no Azure SQL | Manual ou após deploy da API |
| **azure-functions-deploy.yml** | Deploy para Azure Functions (opcional) | Push em `/src/Arxis.Functions/**` |

#### 2. Documentação Azure

| Arquivo | Conteúdo |
|---------|----------|
| **AZURE_DEPLOYMENT.md** | Estratégias de deployment (App Service vs Functions vs Container Apps) |
| **.github/SETUP_SECRETS.md** | Guia completo de configuração de secrets e recursos Azure |
| **TODO_CONSOLIDATED.md** | Lista consolidada de TODAS as tarefas pendentes |

---

## 🚀 Como Usar

### Passo 1: Configurar Azure Resources

**Opção A: Automatizado (Recomendado)**

```powershell
# Windows PowerShell
cd scripts
.\azure-setup.ps1
```

```bash
# Linux/Mac
cd scripts
chmod +x azure-setup.sh
./azure-setup.sh
```

**Opção B: Manual via Azure CLI**

Ver instruções detalhadas em `.github/SETUP_SECRETS.md`

### Passo 2: Configurar GitHub Secrets

```bash
# Instalar GitHub CLI
# https://cli.github.com/

# Login
gh auth login

# Adicionar secrets
gh secret set AZURE_CLIENT_ID
gh secret set AZURE_TENANT_ID
gh secret set AZURE_SUBSCRIPTION_ID
gh secret set AZURE_SQL_CONNECTION_STRING
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
gh secret set VITE_API_URL
```

**OU via GitHub Web:**
1. Ir para Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Adicionar cada secret da lista

### Passo 3: Testar Workflows

```bash
# 1. Fazer uma mudança pequena
echo "# Test" >> README.md

# 2. Commit e push
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main

# 3. Ver workflows rodando
# GitHub → Actions tab
```

---

## 📊 Estrutura de Deploy

### Arquitetura Recomendada

```
┌─────────────────────────────────────────────────┐
│           GitHub Repository (avilaops/Arxis)    │
│                                                  │
│  Push to main                                    │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│         GitHub Actions (CI/CD)                  │
│                                                  │
│  1. Build & Test                                │
│  2. Security Scan                               │
│  3. Deploy to Azure                             │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│               Azure Cloud                        │
│                                                  │
│  ┌───────────────────────┐                      │
│  │ Azure Static Web Apps │  Frontend (React)    │
│  │ arxis-web             │  CDN Global          │
│  └───────────────────────┘                      │
│                                                  │
│  ┌───────────────────────┐                      │
│  │ Azure App Service     │  Backend API         │
│  │ arxis-api             │  ASP.NET Core 10     │
│  └───────────────────────┘                      │
│                                                  │
│  ┌───────────────────────┐                      │
│  │ Azure SQL Database    │  Dados               │
│  │ arxis-db              │  EF Core Migrations  │
│  └───────────────────────┘                      │
│                                                  │
│  ┌───────────────────────┐  (Futuro)            │
│  │ Azure Blob Storage    │  Arquivos BIM/Docs   │
│  └───────────────────────┘                      │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Desenvolvimento

### Desenvolvimento Local

```bash
# 1. Criar branch de feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças
# ... código ...

# 3. Testar localmente
# Backend:
cd src/Arxis.API
dotnet run

# Frontend:
cd src/Arxis.Web
npm run dev

# 4. Commit
git add .
git commit -m "feat: add new functionality"

# 5. Push
git push origin feature/nova-funcionalidade

# 6. Criar Pull Request no GitHub
# → CI build automático roda
# → Code review
# → Merge para main
```

### Deploy Automático

```bash
# Quando merge para main acontece:

1. ✅ CI Build roda
   - Build backend
   - Build frontend
   - Run tests
   - Security scan
   - Code quality check

2. ✅ Backend Deploy roda (se mudou API)
   - Build project
   - Publish artifacts
   - Deploy to Azure App Service
   - Run health check

3. ✅ Frontend Deploy roda (se mudou Web)
   - Build React app
   - Deploy to Azure Static Web Apps
   - Update CDN

4. ✅ Database Migrate (manual ou automático)
   - Generate migration script
   - Apply to Azure SQL
   - Verify success
```

---

## 📋 Checklist de Setup Inicial

### Azure Resources (30-60 min)

- [ ] Criar conta Azure (se não tiver)
- [ ] Executar script `azure-setup.ps1` ou `azure-setup.sh`
- [ ] Verificar recursos criados no Azure Portal
- [ ] Copiar connection strings e tokens

### GitHub Configuration (15-30 min)

- [ ] Configurar Service Principal
- [ ] Adicionar todos os secrets necessários
- [ ] Criar environments (dev, staging, prod) - opcional
- [ ] Configurar branch protection rules - opcional

### Primeiro Deploy (10-15 min)

- [ ] Fazer push para main
- [ ] Verificar workflows no GitHub Actions
- [ ] Testar API no Azure
- [ ] Testar Frontend no Azure
- [ ] Executar migration manualmente

### Verificação Final (5-10 min)

- [ ] API acessível: `https://arxis-api.azurewebsites.net/swagger`
- [ ] Frontend acessível: `https://arxis-web.azurestaticapps.net`
- [ ] Banco de dados com migrations aplicadas
- [ ] Health check retorna OK

---

## 🎯 Próximas Ações

### Hoje (2 horas)

1. **Ler documentação**
   - [ ] `.github/SETUP_SECRETS.md`
   - [ ] `AZURE_DEPLOYMENT.md`
   - [ ] `TODO_CONSOLIDATED.md`

2. **Setup Azure**
   - [ ] Executar script de setup
   - [ ] Verificar recursos criados
   - [ ] Copiar secrets

3. **Configurar GitHub**
   - [ ] Adicionar secrets
   - [ ] Fazer test push

### Esta Semana (8-12 horas)

1. **Implementar Segurança**
   - [ ] JWT Authentication (ver `ACTION_PLAN.md`)
   - [ ] User Secrets local
   - [ ] FluentValidation

2. **Testar CI/CD**
   - [ ] Fazer deploy de teste
   - [ ] Verificar workflows
   - [ ] Corrigir problemas

### Próximas Semanas

Ver `TODO_CONSOLIDATED.md` para lista completa

---

## 📚 Documentos de Referência

### Setup e Deploy

| Documento | Quando usar |
|-----------|-------------|
| **AZURE_DEPLOYMENT.md** | Entender estratégias de deploy |
| **.github/SETUP_SECRETS.md** | Configurar Azure e GitHub |
| **TODO_CONSOLIDATED.md** | Ver todas as tarefas pendentes |

### Desenvolvimento

| Documento | Quando usar |
|-----------|-------------|
| **ACTION_PLAN.md** | Implementar features passo-a-passo |
| **IMPROVEMENTS.md** | Ver lista de melhorias |
| **TECHNICAL_ISSUES.md** | Corrigir problemas conhecidos |

### Referência

| Documento | Quando usar |
|-----------|-------------|
| **QUICKSTART.md** | Rodar projeto localmente |
| **docs/DEVELOPMENT.md** | Comandos e convenções |
| **GIT_GUIDE.md** | Trabalhar com Git |

---

## 🔧 Troubleshooting

### Workflow falha: "No subscription found"

```bash
# Verificar secrets configurados
gh secret list

# Recriar Service Principal
az ad sp create-for-rbac --name "arxis-github-actions" ...
```

### API deploy falha: "Resource not found"

```bash
# Verificar se App Service existe
az webapp list --resource-group arxis-rg

# Recriar se necessário
az webapp create --name arxis-api ...
```

### Frontend deploy falha: "Invalid token"

```bash
# Obter novo token da Static Web App
az staticwebapp secrets list --name arxis-web ...

# Atualizar secret no GitHub
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
```

### Database migration falha: "Connection refused"

```bash
# Verificar connection string
echo $AZURE_SQL_CONNECTION_STRING

# Verificar firewall rules
az sql server firewall-rule list --resource-group arxis-rg --server arxis-sql-server

# Adicionar seu IP se necessário
az sql server firewall-rule create --name AllowMyIP --start-ip-address X.X.X.X --end-ip-address X.X.X.X
```

---

## ✅ Status Atual

### O que está funcionando

- ✅ Workflows criados e commitados
- ✅ Documentação completa
- ✅ Scripts de setup prontos
- ✅ Estrutura de CI/CD definida

### O que precisa ser feito

- ⏳ Executar setup do Azure
- ⏳ Configurar GitHub Secrets
- ⏳ Testar primeiro deploy
- ⏳ Implementar autenticação (prioridade)

---

## 🎉 Conclusão

Você agora tem:

1. **5 workflows GitHub Actions** prontos para CI/CD
2. **Documentação completa** de setup Azure
3. **Scripts automatizados** para criar recursos
4. **Guia consolidado** de todas as tarefas
5. **Estrutura profissional** de DevOps

**Próximo passo:** Seguir `.github/SETUP_SECRETS.md` para fazer o setup inicial!

---

**Criado em:** 2025-12-22  
**Última atualização:** 2025-12-22  
**Versão:** 1.0  
**Status:** ✅ Pronto para deployment

🚀 **Let's ship it to Azure!**


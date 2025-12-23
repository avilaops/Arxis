# 🔐 Configuração de Secrets para GitHub Actions

## 📋 Secrets Necessários

Configure estes secrets em: **Settings → Secrets and variables → Actions**

### 1️⃣ Azure Authentication (Obrigatório para todos os workflows)

#### Service Principal (Recomendado)

```bash
# 1. Criar Service Principal no Azure
az ad sp create-for-rbac --name "arxis-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth

# 2. Copiar o JSON retornado e criar secrets:
```

**Secrets a criar:**
- `AZURE_CLIENT_ID` - Cliente ID do Service Principal
- `AZURE_TENANT_ID` - Tenant ID do Azure AD
- `AZURE_SUBSCRIPTION_ID` - ID da assinatura Azure

**OU usar credenciais tradicionais:**
- `AZURE_CREDENTIALS` - JSON completo do Service Principal

---

### 2️⃣ Backend API Secrets

#### Azure App Service / Functions

```
AZURE_WEBAPP_PUBLISH_PROFILE
```

**Como obter:**
```bash
# No portal Azure:
# 1. Ir para App Service > arxis-api
# 2. Click em "Get publish profile"
# 3. Copiar conteúdo XML e colar no secret
```

---

### 3️⃣ Frontend Secrets

#### Azure Static Web Apps

```
AZURE_STATIC_WEB_APPS_API_TOKEN
```

**Como obter:**
```bash
# No portal Azure:
# 1. Ir para Static Web App > arxis-web
# 2. Copiar o "Deployment token"
# 3. Colar no secret
```

#### Environment Variables do Frontend

```
VITE_API_URL
```

**Valor:**
- Development: `http://localhost:5000/api`
- Production: `https://arxis-api.azurewebsites.net/api`

---

### 4️⃣ Database Secrets

```
AZURE_SQL_CONNECTION_STRING
```

**Formato:**
```
Server=tcp:arxis-sql-server.database.windows.net,1433;Initial Catalog=arxis-db;Persist Security Info=False;User ID={username};Password={password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

**Como configurar:**
1. No Azure Portal, criar Azure SQL Database
2. Copiar connection string
3. Substituir {username} e {password}
4. Adicionar como secret

---

### 5️⃣ Secrets Opcionais (Para CI avançado)

#### SonarCloud (Code Quality)

```
SONAR_TOKEN
```

**Como obter:**
1. Criar conta em https://sonarcloud.io
2. Criar novo projeto
3. Copiar token
4. Adicionar como secret

#### Codecov (Code Coverage)

```
CODECOV_TOKEN
```

**Como obter:**
1. Criar conta em https://codecov.io
2. Adicionar repositório
3. Copiar token

---

## 🚀 Setup Rápido - Linha de Comando

### 1. Criar Service Principal

```bash
# Login no Azure
az login

# Definir variáveis
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
RESOURCE_GROUP="arxis-rg"
APP_NAME="arxis"

# Criar Service Principal
az ad sp create-for-rbac \
  --name "arxis-github-actions" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --json-auth > azure-credentials.json

# Ver resultado
cat azure-credentials.json
```

### 2. Extrair valores para GitHub Secrets

```bash
# Client ID
cat azure-credentials.json | jq -r '.clientId'

# Tenant ID
cat azure-credentials.json | jq -r '.tenantId'

# Subscription ID
cat azure-credentials.json | jq -r '.subscriptionId'
```

### 3. Configurar secrets via GitHub CLI

```bash
# Instalar GitHub CLI: https://cli.github.com/

# Login
gh auth login

# Navegar para o repositório
cd /path/to/arxis

# Adicionar secrets
gh secret set AZURE_CLIENT_ID < client-id.txt
gh secret set AZURE_TENANT_ID < tenant-id.txt
gh secret set AZURE_SUBSCRIPTION_ID < subscription-id.txt

# OU adicionar JSON completo
gh secret set AZURE_CREDENTIALS < azure-credentials.json
```

---

## 📦 Criação de Recursos Azure

### Script PowerShell Completo

```powershell
# azure-setup.ps1

# Variáveis
$resourceGroup = "arxis-rg"
$location = "eastus"
$appName = "arxis"
$sqlServerName = "arxis-sql-server"
$sqlDbName = "arxis-db"
$sqlAdminUser = "arxisadmin"
$sqlAdminPassword = (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force)

# 1. Criar Resource Group
az group create --name $resourceGroup --location $location

# 2. Criar App Service Plan
az appservice plan create `
  --name "$appName-plan" `
  --resource-group $resourceGroup `
  --sku B1 `
  --is-linux

# 3. Criar Web App para API
az webapp create `
  --name "$appName-api" `
  --resource-group $resourceGroup `
  --plan "$appName-plan" `
  --runtime "DOTNETCORE:10.0"

# 4. Criar Static Web App para Frontend
az staticwebapp create `
  --name "$appName-web" `
  --resource-group $resourceGroup `
  --location $location

# 5. Criar Azure SQL Server
az sql server create `
  --name $sqlServerName `
  --resource-group $resourceGroup `
  --location $location `
  --admin-user $sqlAdminUser `
  --admin-password $sqlAdminPassword

# 6. Criar Azure SQL Database
az sql db create `
  --resource-group $resourceGroup `
  --server $sqlServerName `
  --name $sqlDbName `
  --service-objective S0

# 7. Configurar Firewall (permitir Azure services)
az sql server firewall-rule create `
  --resource-group $resourceGroup `
  --server $sqlServerName `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

# 8. Obter connection string
$connectionString = az sql db show-connection-string `
  --client ado.net `
  --server $sqlServerName `
  --name $sqlDbName `
  --output tsv

Write-Host "Connection String: $connectionString"

# 9. Obter Static Web App token
$staticWebAppToken = az staticwebapp secrets list `
  --name "$appName-web" `
  --resource-group $resourceGroup `
  --query "properties.apiKey" `
  --output tsv

Write-Host "Static Web App Token: $staticWebAppToken"

# 10. Configurar App Settings no Web App
az webapp config appsettings set `
  --name "$appName-api" `
  --resource-group $resourceGroup `
  --settings `
    "ConnectionStrings__DefaultConnection=$connectionString"

Write-Host "Azure resources created successfully!"
Write-Host "Configure these secrets in GitHub:"
Write-Host "- AZURE_SQL_CONNECTION_STRING: $connectionString"
Write-Host "- AZURE_STATIC_WEB_APPS_API_TOKEN: $staticWebAppToken"
```

### Script Bash (Linux/Mac)

```bash
#!/bin/bash
# azure-setup.sh

# Variáveis
RESOURCE_GROUP="arxis-rg"
LOCATION="eastus"
APP_NAME="arxis"
SQL_SERVER_NAME="arxis-sql-server"
SQL_DB_NAME="arxis-db"
SQL_ADMIN_USER="arxisadmin"
SQL_ADMIN_PASSWORD="P@ssw0rd123!"

# 1. Criar Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Criar App Service Plan
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# 3. Criar Web App para API
az webapp create \
  --name "${APP_NAME}-api" \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "DOTNETCORE:10.0"

# 4. Criar Static Web App
az staticwebapp create \
  --name "${APP_NAME}-web" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# 5. Criar SQL Server
az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASSWORD

# 6. Criar SQL Database
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $SQL_DB_NAME \
  --service-objective S0

# 7. Firewall rule
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 8. Get connection string
CONNECTION_STRING=$(az sql db show-connection-string \
  --client ado.net \
  --server $SQL_SERVER_NAME \
  --name $SQL_DB_NAME \
  --output tsv)

echo "Connection String: $CONNECTION_STRING"

# 9. Get Static Web App token
STATIC_WEB_APP_TOKEN=$(az staticwebapp secrets list \
  --name "${APP_NAME}-web" \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" \
  --output tsv)

echo "Static Web App Token: $STATIC_WEB_APP_TOKEN"

# 10. Configure App Settings
az webapp config appsettings set \
  --name "${APP_NAME}-api" \
  --resource-group $RESOURCE_GROUP \
  --settings \
    "ConnectionStrings__DefaultConnection=$CONNECTION_STRING"

echo "Azure resources created successfully!"
```

---

## ✅ Checklist de Configuração

### GitHub Secrets

- [ ] `AZURE_CLIENT_ID`
- [ ] `AZURE_TENANT_ID`
- [ ] `AZURE_SUBSCRIPTION_ID`
- [ ] `AZURE_SQL_CONNECTION_STRING`
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] `VITE_API_URL` (environment variable)
- [ ] `SONAR_TOKEN` (opcional)
- [ ] `CODECOV_TOKEN` (opcional)

### Azure Resources

- [ ] Resource Group criado
- [ ] App Service Plan criado
- [ ] Web App (API) criado
- [ ] Static Web App (Frontend) criado
- [ ] Azure SQL Server criado
- [ ] Azure SQL Database criado
- [ ] Firewall rules configurado
- [ ] Service Principal criado

### GitHub Repository

- [ ] Workflows criados em `.github/workflows/`
- [ ] Secrets configurados
- [ ] Branch protection rules (opcional)
- [ ] Environments configurados (dev, staging, prod)

---

## 🔧 Troubleshooting

### Erro: "No subscription found"

```bash
# Ver assinaturas disponíveis
az account list --output table

# Definir assinatura padrão
az account set --subscription "nome-ou-id-da-assinatura"
```

### Erro: "Service Principal does not exist"

```bash
# Listar Service Principals
az ad sp list --display-name "arxis-github-actions"

# Recriar se necessário
az ad sp delete --id <app-id>
# Depois rodar o comando de create novamente
```

### Erro: "Resource already exists"

```bash
# Deletar resource group e recriar
az group delete --name arxis-rg --yes --no-wait

# Aguardar exclusão completa antes de recriar
```

---

## 📞 Links Úteis

- [Azure CLI Install](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [GitHub CLI Install](https://cli.github.com/)
- [Azure Portal](https://portal.azure.com)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Azure DevOps Docs](https://docs.microsoft.com/azure/devops)

---

**Última atualização:** 2025-12-22  
**Versão:** 1.0


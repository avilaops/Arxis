# 📊 Análise dos Recursos Azure - Arxis

## ✅ Recursos Existentes

Você tem os seguintes recursos criados no Azure:

### 1. 📁 Resource Group
- **Nome**: `Arxis`
- **Região**: West US 2
- **Status**: ✅ Succeeded
- **Tags**: ArxisVR, ArxisBuild, ArxisStructure

---

### 2. 🌐 Static Web App (Frontend)
- **Nome**: `Arxis-Web` (Arxis)
- **Tipo**: Microsoft.Web/staticSites
- **Plano**: Standard (pago)
- **URL**: https://kind-sand-04db77a1e.1.azurestaticapps.net
- **IP Estático**: 20.99.163.40
- **Repositório**: https://github.com/avilaops/Arxis
- **Branch**: main
- **Status**: ✅ Funcionando
- **Provider**: GitHub

**✅ Pronto para uso** - Deploy automático configurado via GitHub Actions

---

### 3. 💾 SQL Database
- **Nome**: `Arxis`
- **Servidor**: `arxis`
- **Tipo**: Microsoft.Sql/servers/databases
- **Plano**: GP_S_Gen5_2 (General Purpose Serverless, 2 vCores)
- **Região**: West Europe
- **Tamanho Máximo**: 32 GB
- **Status**: ⚠️ **Paused** (pausado para economizar)
- **Auto Pause**: 60 minutos
- **Free Limit**: ✅ Ativado
- **Collation**: SQL_Latin1_General_CP1_CI_AS

**⚠️ Atenção**: Banco está **pausado**. Isso é normal no plano Serverless para economizar custos.

---

### 4. 📊 Application Insights (Monitoramento)
- **Nome**: `Arxis`
- **Tipo**: microsoft.insights/components
- **Região**: West US 2
- **Status**: ✅ Succeeded
- **Retenção de Dados**: 90 dias
- **Connection String**:
  ```
  InstrumentationKey=6b65b548-3d2d-4974-aae1-76c946a47b57;
  IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;
  LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/
  ```

**✅ Pronto para uso** - Para monitoramento e logs da aplicação

---

### 5. 🔧 App Service Plan (Função)
- **Nome**: `ASP-Arxis-bc89`
- **Tipo**: FlexConsumption (Function App)
- **Plano**: FC1
- **Região**: West US 2
- **Status**: ✅ Running
- **Workers**: Dynamic (0 alocados)

**ℹ️ Informação**: Este é um plano para Azure Functions, não para o backend .NET

---

### 6. 🔐 Managed Identity
- **Nome**: `arxis`
- **Tipo**: User Assigned Identity
- **Região**: West US 2
- **Status**: ✅ Provisionado
- **Principal ID**: e461ff52-b533-42c2-a4ba-92acee23887d
- **Client ID**: 721d7de0-2d20-497d-bb2f-fc24363c95b8

**✅ Pronto para uso** - Para autenticação entre serviços Azure

---

## ❌ Recursos Faltando

### 🚨 **CRÍTICO**: App Service para Backend .NET

Você **NÃO TEM** um App Service para rodar a API .NET!

O workflow de deploy ([deploy-backend.yml](deploy-backend.yml#L18)) espera um App Service chamado **"Arxis"**, mas ele não existe.

### O que precisa ser criado:

```powershell
# Criar App Service Plan para Linux
az appservice plan create `
  --name arxis-api-plan `
  --resource-group Arxis `
  --sku B1 `
  --is-linux `
  --location westus2

# Criar App Service (Web App)
az webapp create `
  --resource-group Arxis `
  --plan arxis-api-plan `
  --name Arxis `
  --runtime "DOTNETCORE:8.0"
```

**Por que está faltando?**
- O plano `ASP-Arxis-bc89` é para **Function Apps** (serverless functions)
- O backend .NET precisa de um **App Service** (Web App)
- São dois tipos diferentes de recursos no Azure

---

## 🗄️ Banco de Dados: SQLite vs SQL Server

### Situação Atual:
- ✅ Você tem **SQL Server no Azure** (Arxis-SQL)
- ❌ Seu código usa **SQLite** (arquivo local)

### Problema:
No `appsettings.json`, a connection string é:
```json
"DefaultConnection": "Data Source=arxis.db"
```

Isso é **SQLite** (arquivo local), mas você tem um **SQL Server no Azure** criado e pausado.

### Opções:

#### Opção 1: Continuar com SQLite (Recomendado para começar)
- ✅ Mais simples
- ✅ Grátis
- ✅ Já funciona localmente
- ⚠️ Arquivo pode ser perdido em restarts do App Service
- **Ação**: Nada, está ok

#### Opção 2: Usar SQL Server do Azure
- ✅ Mais robusto
- ✅ Dados persistentes
- ⚠️ Mais complexo de configurar
- ⚠️ Custo (mesmo no free tier)
- **Ação**: Mudar connection string e migrations

---

## 📋 Checklist de Deploy

### Antes do Deploy:

- [ ] **CRIAR App Service para o backend .NET**
  ```powershell
  az appservice plan create --name arxis-api-plan --resource-group Arxis --sku B1 --is-linux --location westus2
  az webapp create --resource-group Arxis --plan arxis-api-plan --name Arxis --runtime "DOTNETCORE:8.0"
  ```

- [ ] **Configurar variáveis de ambiente no App Service**
  ```powershell
  az webapp config appsettings set --resource-group Arxis --name Arxis --settings `
    Email__SmtpHost="smtp.porkbun.com" `
    Email__SmtpPort="587" `
    Email__EnableSsl="true" `
    Email__FromAddress="nicolas@avila.inc" `
    Email__SmtpUser="nicolas@avila.inc" `
    Email__SmtpPassword="7Aciqgr7@3278579"
  ```

- [ ] **Configurar Application Insights no código** (opcional)
  - Adicionar ConnectionString no appsettings.json
  - Adicionar pacote NuGet se necessário

### Depois do Deploy:

- [ ] Testar API: https://arxis.azurewebsites.net/health
- [ ] Acessar Swagger: https://arxis.azurewebsites.net/swagger
- [ ] Testar Frontend: https://kind-sand-04db77a1e.1.azurestaticapps.net
- [ ] Enviar email de teste
- [ ] Verificar logs no Application Insights

---

## 💰 Custos Estimados

### Recursos Atuais:
- **Static Web App (Standard)**: ~$9/mês
- **SQL Database (Serverless)**: ~$0 (free tier) quando pausado
- **Application Insights**: Grátis (até 5GB/mês)
- **Function App Plan (FlexConsumption)**: ~$0 (pay-per-use)
- **Managed Identity**: Grátis

### Após Criar App Service:
- **App Service B1**: ~$13/mês
- **Total Estimado**: ~$22/mês

**Dica**: Para economizar, use o plano **F1 (Free)** no App Service:
```powershell
az appservice plan create --name arxis-api-plan --resource-group Arxis --sku F1 --location westus2
```

---

## 🎯 Recomendações

### 1. ⚠️ URGENTE: Criar App Service
Sem o App Service, o deploy do backend **VAI FALHAR**. Crie antes de fazer push:

```powershell
# Plano FREE (recomendado para testes)
az appservice plan create --name arxis-api-plan --resource-group Arxis --sku F1 --location westus2

# Web App
az webapp create --resource-group Arxis --plan arxis-api-plan --name Arxis --runtime "DOTNETCORE:8.0"
```

### 2. 📊 Configurar Application Insights
Para ver logs e métricas, adicione ao `appsettings.json`:

```json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=6b65b548-3d2d-4974-aae1-76c946a47b57;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;..."
  }
}
```

### 3. 🗄️ Decidir sobre o Banco
- **Para MVP/Testes**: Continuar com SQLite
- **Para Produção**: Migrar para SQL Server do Azure

### 4. 🔐 Proteger Secrets
Nunca commitar:
- Senhas de email no appsettings.json
- Connection strings com senhas
- Instrumentation Keys

Use **Azure Key Vault** ou **GitHub Secrets** + **App Settings**.

---

## 🚀 Próximos Passos

1. **Criar App Service** (comando acima)
2. **Configurar variáveis de ambiente** no Azure Portal
3. **Fazer commit e push** do código
4. **Aguardar deploy automático** via GitHub Actions
5. **Testar** todos os endpoints

---

## 📞 Comandos Úteis

```powershell
# Ver todos os recursos
az resource list --resource-group Arxis --output table

# Ver logs do App Service (depois de criado)
az webapp log tail --resource-group Arxis --name Arxis

# Reiniciar App Service
az webapp restart --resource-group Arxis --name Arxis

# Ver configurações
az webapp config appsettings list --resource-group Arxis --name Arxis
```

---

**Conclusão**: Você tem **quase tudo pronto**, só falta criar o **App Service para o backend .NET**! 🚀

_Análise realizada em 27/12/2024_

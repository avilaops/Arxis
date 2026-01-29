# ✅ Checklist Final de Deploy - Arxis

## Status dos Recursos Azure

### ✅ Recursos Criados
- [x] Resource Group: `Arxis`
- [x] Static Web App: `Arxis` (Frontend)
- [x] App Service: `Arxis-API` (Backend) - **RECÉM CRIADO!**
- [x] App Service Plan: `ASP-Arxis-a38e` (F1 - Free)
- [x] Application Insights: `Arxis`
- [x] SQL Database: `Arxis` (pausado, opcional)

### ⚙️ Configurações Necessárias

#### 1. Variáveis de Ambiente no App Service ⚠️ **PENDENTE**

Você precisa adicionar as configurações de email no Azure Portal:

**Como fazer:**
1. Acesse: https://portal.azure.com
2. Vá em: **Serviços de Aplicativos** → **Arxis-API**
3. Menu lateral: **Configuração** → **Configurações do aplicativo**
4. Clique em **"+ Nova configuração de aplicativo"**
5. Adicione cada uma:

```
Nome: Email__SmtpHost
Valor: smtp.porkbun.com

Nome: Email__SmtpPort
Valor: 587

Nome: Email__EnableSsl
Valor: true

Nome: Email__FromAddress
Valor: nicolas@avila.inc

Nome: Email__FromName
Valor: Arxis Team

Nome: Email__SmtpUser
Valor: nicolas@avila.inc

Nome: Email__SmtpPassword
Valor: 7Aciqgr7@3278579
```

6. Clique em **"Salvar"** no topo da página

---

## Arquivos Prontos para Deploy

### ✅ Backend
- [x] `src/Arxis.API/Controllers/EmailController.cs` - 16 endpoints
- [x] `src/Arxis.API/Services/EmailService.cs` - Sistema completo
- [x] `src/Arxis.API/Services/IEmailService.cs` - Interface
- [x] `src/Arxis.API/Services/NotificationService.cs` - Notificações
- [x] `src/Arxis.API/Models/EmailModels.cs` - DTOs
- [x] `src/Arxis.API/Program.cs` - Serviços registrados
- [x] `src/Arxis.API/appsettings.json` - Configurações
- [x] `.github/workflows/deploy-backend.yml` - **ATUALIZADO** ✨

### ✅ Frontend
- [x] `src/Arxis.Web/src/services/emailService.ts` - Cliente HTTP
- [x] `.github/workflows/azure-static-web-apps-*.yml` - Deploy automático

### ✅ Documentação
- [x] `EMAIL_SYSTEM_DOCUMENTATION.md` - 16 templates documentados
- [x] `DEPLOY_RAPIDO.md` - Guia de deploy
- [x] `ANALISE_RECURSOS_AZURE.md` - Análise de recursos

---

## 🚀 Comandos para Deploy

### Opção 1: Deploy Completo (Backend + Frontend)

```powershell
# No diretório do projeto
cd C:\Users\Administrador\source\repos\Engenharia\Arxis

# Adicionar todos os arquivos novos do sistema de email
git add src/Arxis.API/Controllers/EmailController.cs
git add src/Arxis.API/Services/EmailService.cs
git add src/Arxis.API/Services/IEmailService.cs
git add src/Arxis.API/Services/NotificationService.cs
git add src/Arxis.API/Models/EmailModels.cs
git add src/Arxis.Web/src/services/emailService.ts

# Adicionar arquivos modificados
git add src/Arxis.API/Program.cs
git add src/Arxis.API/appsettings.json
git add src/Arxis.API/appsettings.Development.json

# Adicionar workflow atualizado
git add .github/workflows/deploy-backend.yml

# Adicionar documentação
git add EMAIL_SYSTEM_DOCUMENTATION.md
git add DEPLOY_RAPIDO.md
git add ANALISE_RECURSOS_AZURE.md

# Commit
git commit -m "feat: sistema completo de emails com 16 templates + App Service configurado"

# Push (deploy automático)
git push origin main
```

### Opção 2: Deploy Apenas Backend

```powershell
# Adicionar apenas arquivos do backend
git add src/Arxis.API/**
git add .github/workflows/deploy-backend.yml
git commit -m "feat: backend com sistema de emails"
git push origin main
```

---

## 📊 Acompanhar Deploy

### 1. GitHub Actions
Acesse: https://github.com/avilaops/Arxis/actions

Você verá 2 workflows rodando:
- **Deploy Backend to Azure** (~3-5 minutos)
- **Azure Static Web Apps CI/CD** (~2-3 minutos)

### 2. Logs em Tempo Real

Clique no workflow → Clique no job → Veja os logs de cada step

---

## 🔍 Testes Pós-Deploy

### Backend
```powershell
# 1. Testar se API está respondendo
Invoke-RestMethod -Uri "https://arxis-api.azurewebsites.net"

# 2. Verificar Swagger
start https://arxis-api.azurewebsites.net/swagger

# 3. Testar endpoint de email
$body = @{
    to = "nicolas@avila.inc"
    userName = "Deploy Test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://arxis-api.azurewebsites.net/api/email/send-welcome" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Frontend
```powershell
# Abrir frontend
start https://kind-sand-04db77a1e.1.azurestaticapps.net
```

---

## ⚠️ IMPORTANTE: Antes de fazer Push

1. **Configure as variáveis de ambiente** no Azure Portal (instruções acima)
2. **Verifique se está na branch main**: `git branch`
3. **Verifique status**: `git status`
4. **Faça backup local** (opcional): `git stash`

---

## 🎯 URLs Finais

Após o deploy bem-sucedido:

- **Backend API**: https://arxis-api.azurewebsites.net
- **Swagger Docs**: https://arxis-api.azurewebsites.net/swagger
- **Frontend**: https://kind-sand-04db77a1e.1.azurestaticapps.net
- **GitHub Actions**: https://github.com/avilaops/Arxis/actions

---

## 🐛 Troubleshooting

### Se o deploy falhar:

1. **Verificar logs** no GitHub Actions
2. **Verificar se App Service existe**:
   - Portal Azure → Serviços de Aplicativos → Arxis-API
3. **Verificar secrets do GitHub**:
   - GitHub → Settings → Secrets and variables → Actions
4. **Reiniciar App Service**:
   - Portal Azure → Arxis-API → Visão Geral → Reiniciar

### Se email não enviar:

1. **Verificar variáveis de ambiente** no App Service
2. **Verificar logs** no Application Insights
3. **Testar localmente** primeiro

---

## 💰 Custos

- **App Service F1**: Grátis (1GB RAM, 60 min CPU/dia)
- **Static Web App Standard**: ~$9/mês
- **SQL Database Serverless**: Grátis quando pausado
- **Application Insights**: Grátis (até 5GB/mês)

**Total**: ~$9/mês (ou grátis se downgrade Static Web App para Free)

---

## ✅ Checklist Final

Antes de fazer push:

- [ ] App Service `Arxis-API` criado ✅
- [ ] Variáveis de ambiente configuradas no Azure ⚠️ **PENDENTE**
- [ ] Workflow atualizado com nome correto ✅
- [ ] Código commitado localmente
- [ ] Branch é `main`
- [ ] Pronto para push! 🚀

---

## 🚀 Próximo Comando

Depois de configurar as variáveis de ambiente, rode:

```powershell
git add .
git commit -m "feat: sistema completo de emails com 16 templates"
git push origin main
```

E acompanhe em: https://github.com/avilaops/Arxis/actions

---

_Última atualização: 27/12/2024 - 08:40_

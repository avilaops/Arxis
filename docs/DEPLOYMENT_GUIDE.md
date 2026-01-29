# 🚀 Guia de Deploy - ARXIS

## ✅ Pré-requisitos Concluídos

- [x] Secrets do GitHub configurados
- [x] Workflows do GitHub Actions criados
- [x] Estrutura do projeto pronta

## 🔐 Secrets Configurados

Os seguintes secrets foram configurados no GitHub:

- `AZUREAPPSERVICE_CLIENTID_32E0F01D5B614D2AA49E4264B5644273`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_FA67118CA3C245008A7E96EB5EA5B039`
- `AZUREAPPSERVICE_TENANTID_D7166BD585C64EAAB1891B254500223E`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_KIND_SAND_04DB77A1E`

## 📋 Recursos Necessários no Azure

### 1. Backend (App Service)
- **Nome**: `arxis-api`
- **Runtime**: .NET 8
- **Sistema Operacional**: Linux
- **Plano de Serviço**: B1 ou superior

### 2. Frontend (Static Web Apps)
- **Nome**: Configurado automaticamente
- **Token**: Já configurado nos secrets

## 🚀 Como Fazer o Deploy

### Opção 1: Deploy Automático (Recomendado)

1. **Commit e Push das mudanças**:
```bash
git add .
git commit -m "feat: adicionar workflows de deploy"
git push origin main
```

2. **Verificar o progresso**:
   - Acesse: https://github.com/avilaops/Arxis/actions
   - Acompanhe os workflows em execução

### Opção 2: Deploy Manual

Execute manualmente os workflows:

```bash
# Via GitHub CLI
gh workflow run deploy-backend.yml
gh workflow run deploy-frontend.yml
```

Ou pela interface do GitHub:
1. Vá para Actions → Selecione o workflow
2. Clique em "Run workflow"

## 📦 O que será deployado

### Backend
- API REST em .NET 8
- Endpoint: `https://arxis-api.azurewebsites.net`
- Documentação Swagger: `/swagger`

### Frontend
- Aplicação React
- URL será fornecida após o primeiro deploy
- CDN global via Azure Static Web Apps

## 🔧 Configurações Adicionais Necessárias

### 1. Criar App Service no Azure (se ainda não existir)

```bash
# Login no Azure
az login

# Criar Resource Group
az group create --name arxis-rg --location brazilsouth

# Criar App Service Plan
az appservice plan create \
  --name arxis-plan \
  --resource-group arxis-rg \
  --sku B1 \
  --is-linux

# Criar App Service
az webapp create \
  --resource-group arxis-rg \
  --plan arxis-plan \
  --name arxis-api \
  --runtime "DOTNETCORE:8.0"
```

### 2. Configurar Connection String no Azure

```bash
# Adicionar connection string
az webapp config connection-string set \
  --resource-group arxis-rg \
  --name arxis-api \
  --settings DefaultConnection="Data Source=arxis.db" \
  --connection-string-type SQLite
```

### 3. Configurar CORS no App Service

```bash
az webapp cors add \
  --resource-group arxis-rg \
  --name arxis-api \
  --allowed-origins '*'
```

## 🔍 Verificação Pós-Deploy

### Backend
```bash
# Verificar se a API está respondendo
curl https://arxis-api.azurewebsites.net/health

# Verificar Swagger
# Abrir: https://arxis-api.azurewebsites.net/swagger
```

### Frontend
```bash
# A URL será exibida nos logs do workflow
# Exemplo: https://kind-sand-04db77a1e.azurestaticapps.net
```

## 🐛 Troubleshooting

### Erro: App Service não encontrado
**Solução**: Execute os comandos acima para criar o App Service

### Erro: Build falhou
**Solução**: Verifique os logs no GitHub Actions

### Erro: Deploy do frontend falhou
**Solução**: Verifique se o token do Static Web Apps está correto

## 📊 Monitoramento

### Logs do Backend
```bash
# Visualizar logs em tempo real
az webapp log tail \
  --resource-group arxis-rg \
  --name arxis-api
```

### Logs do Frontend
- Acesse o portal do Azure
- Static Web Apps → Monitoring → Logs

## 🔄 Próximos Passos

1. ✅ Fazer commit e push dos workflows
2. ⏳ Aguardar conclusão do deploy automático
3. 🔍 Verificar se os serviços estão funcionando
4. 🎨 Configurar domínio customizado (opcional)
5. 📈 Configurar Application Insights (monitoramento)

## 📞 Suporte

Em caso de problemas, verifique:
- GitHub Actions: https://github.com/avilaops/Arxis/actions
- Azure Portal: https://portal.azure.com
- Logs do App Service

---

**Desenvolvido por**: [Avila Soluções Empresariais](https://avila.inc)

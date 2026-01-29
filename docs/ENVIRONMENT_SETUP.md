# ARXIS - Configuração de Ambiente

## 📋 Visão Geral

Este documento descreve como configurar as variáveis de ambiente para o projeto ARXIS.

## 🔧 Configuração

### Backend (.NET API)

1. **Arquivo de Configuração**: As credenciais são gerenciadas através do `appsettings.json` e `appsettings.Development.json`

2. **Estrutura**:
   - `appsettings.json` - Configurações de produção (sem credenciais reais)
   - `appsettings.Development.json` - Configurações de desenvolvimento (com credenciais de teste)

3. **Uso no Código**:
```csharp
// Injetar ExternalServicesConfig no controller/service
public class MyController : ControllerBase
{
    private readonly ExternalServicesConfig _config;

    public MyController(ExternalServicesConfig config)
    {
        _config = config;
    }

    public IActionResult UseOpenAI()
    {
        var apiKey = _config.OpenAIApiKey;
        // Use a API key...
    }
}
```

### Frontend (React + Vite)

1. **Arquivos**:
   - `.env` - Variáveis de desenvolvimento (não commitado)
   - `.env.example` - Template de exemplo

2. **Importante**: Vite requer o prefixo `VITE_` para expor variáveis ao navegador

3. **Uso no Código**:
```typescript
import env from '@/config/env';

// Usar as variáveis
const apiUrl = env.apiUrl;
const companyName = env.companyName;
const googleMapsKey = env.google.mapsApiKey;
```

## 🔐 Segurança

### ✅ Boas Práticas

- Nunca commitar arquivos `.env` ou `appsettings.Development.json`
- Usar `.env.example` como template
- Rotacionar chaves regularmente
- Usar diferentes credenciais para dev/prod
- Limitar permissões das API keys

### ⚠️ Arquivos Protegidos pelo .gitignore

```
.env
.env.local
.env.*.local
appsettings.Development.json
```

## 📦 Serviços Configurados

### Backend
- ✅ MongoDB Atlas
- ✅ Email (Gmail SMTP)
- ✅ GitHub API
- ✅ OpenAI/GPT-4
- ✅ Google Cloud Services
- ✅ Sentry (Error Tracking)
- ✅ Stripe (Payments)
- ✅ PayPal (Payments)

### Frontend
- ✅ API Configuration
- ✅ Google Maps
- ✅ Company Links
- ✅ Feature Flags

## 🚀 Começando

### 1. Backend
```bash
cd src/Arxis.API
# O appsettings.Development.json já está configurado
dotnet run
```

### 2. Frontend
```bash
cd src/Arxis.Web
# Criar .env baseado no .env.example
cp .env.example .env
# Editar com suas credenciais
npm install
npm run dev
```

## 📝 Variáveis Disponíveis

### Frontend (VITE)
- `VITE_API_URL` - URL da API
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps
- `VITE_COMPANY_NAME` - Nome da empresa
- Ver `.env.example` para lista completa

### Backend (appsettings)
- `ConnectionStrings:MongoAtlasUri` - MongoDB
- `Email:*` - Configurações de email
- `ExternalServices:*` - APIs externas
- Ver `appsettings.json` para lista completa

## 🆘 Suporte

- Documentação: https://docs.avila.inc
- Suporte: support@avila.inc
- LinkedIn: https://linkedin.com/company/avila-devops

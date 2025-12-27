# 🔧 Configuração Completa do Clarity Analytics

## 📋 Resumo da Integração

### O que foi implementado:

1. **✅ Frontend (index.html)**
   - Script do Clarity adicionado
   - Project ID configurado: `urzs0mg9yx`
   - Tracking automático de sessões, cliques, scroll, etc.

2. **✅ Backend (API .NET)**
   - `ClarityService.cs` - Serviço para integração com API do Clarity
   - `AnalyticsService.cs` - Tracking de eventos de negócio
   - `DashboardService.cs` - Agregação de métricas
   - `AnalyticsController.cs` - Endpoints REST para analytics
   - `DashboardController.cs` - Endpoints REST para dashboard + Clarity

3. **✅ Configuração (.env + appsettings.json)**
   - Arquivo `.env` com token e project ID
   - `appsettings.json` configurado para ler variáveis
   - `Program.cs` carregando .env com DotNetEnv

---

## 🚨 PROBLEMA IDENTIFICADO

### ❌ O problema:
O `appsettings.json` está usando **sintaxe incorreta** para variáveis de ambiente:

```json
"Clarity": {
  "ApiToken": "${CLARITY_API_TOKEN}",    // ❌ ERRADO - isso não funciona no .NET
  "ProjectId": "${CLARITY_PROJECT_ID}"   // ❌ ERRADO
}
```

### ✅ Solução:
O .NET **NÃO** substitui automaticamente `${VAR}` no appsettings.json. Existem 3 formas de resolver:

---

## 🔧 Opção 1: Usar Env.SetEnvironmentVariables() (RECOMENDADO)

### 1. Atualizar Program.cs para carregar variáveis como variáveis de ambiente:

```csharp
using DotNetEnv;

// Load .env file e define como variáveis de ambiente do sistema
Env.Load();
Env.TraversePath().Load();

// Configurar manualmente se necessário
Environment.SetEnvironmentVariable("Clarity__ApiToken",
    Environment.GetEnvironmentVariable("CLARITY_API_TOKEN"));
Environment.SetEnvironmentVariable("Clarity__ProjectId",
    Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID"));

var builder = WebApplication.CreateBuilder(args);
```

### 2. Deixar appsettings.json vazio:

```json
"Clarity": {
  "ApiToken": "",
  "ProjectId": ""
}
```

### 3. O .NET vai ler automaticamente de:
- Variáveis de ambiente do sistema: `Clarity__ApiToken` e `Clarity__ProjectId`
- Formato: Use `__` (dois underscores) para seções aninhadas

---

## 🔧 Opção 2: Ler direto do .env no código

### 1. Criar um método de extensão para carregar .env:

```csharp
// Program.cs
using DotNetEnv;

Env.Load();

// Sobrescrever configurações com valores do .env
builder.Configuration["Clarity:ApiToken"] =
    Environment.GetEnvironmentVariable("CLARITY_API_TOKEN");
builder.Configuration["Clarity:ProjectId"] =
    Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID");

var builder = WebApplication.CreateBuilder(args);
```

---

## 🔧 Opção 3: Usar appsettings.Development.json (LOCAL ONLY)

Para desenvolvimento local, criar `appsettings.Development.json`:

```json
{
  "Clarity": {
    "ApiToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ...",
    "ProjectId": "urzs0mg9yx"
  }
}
```

⚠️ **IMPORTANTE**: Adicionar ao `.gitignore`:
```
appsettings.Development.json
appsettings.Production.json
.env
```

---

## 📦 Arquivos Afetados

### ✅ Já Configurados:
- [x] `.env` - Token e Project ID
- [x] `src/Arxis.Web/index.html` - Script Clarity
- [x] `src/Arxis.API/Services/ClarityService.cs`
- [x] `src/Arxis.API/Services/AnalyticsService.cs`
- [x] `src/Arxis.API/Services/DashboardService.cs`
- [x] `src/Arxis.API/Controllers/AnalyticsController.cs`
- [x] `src/Arxis.API/Controllers/DashboardController.cs`
- [x] `src/Arxis.Web/src/pages/AdminDashboard.tsx`

### 🔧 Precisa Corrigir:
- [ ] `src/Arxis.API/Program.cs` - Configurar leitura de variáveis
- [ ] `src/Arxis.API/appsettings.json` - Remover sintaxe `${VAR}`
- [ ] `src/Arxis.Web/src/App.tsx` - Adicionar rota do dashboard

---

## 🚀 Próximos Passos

### 1. Corrigir leitura de variáveis:
```bash
# Vou atualizar o Program.cs automaticamente
```

### 2. Adicionar rota do dashboard:
```typescript
// src/Arxis.Web/src/App.tsx
<Route path="/admin/analytics" element={<AdminDashboard />} />
```

### 3. Configurar Azure (para produção):
```bash
az webapp config appsettings set \
  --resource-group Arxis \
  --name Arxis-API \
  --settings \
    Clarity__ApiToken="SEU_TOKEN_AQUI" \
    Clarity__ProjectId="urzs0mg9yx"
```

---

## 📊 Endpoints Disponíveis

Depois de corrigir, você terá:

### Analytics:
- `POST /api/analytics/plan-interest` - Track interesse em plano
- `POST /api/analytics/checkout/started` - Track checkout iniciado
- `POST /api/analytics/checkout/completed` - Track venda completa
- `POST /api/analytics/feature-used` - Track uso de features

### Dashboard:
- `GET /api/dashboard/analytics/metrics?days=30` - Métricas agregadas
- `GET /api/dashboard/analytics/recent-events?limit=20` - Eventos recentes
- `GET /api/dashboard/clarity/metrics?projectId=urzs0mg9yx&days=7` - Métricas do Clarity
- `GET /api/dashboard/clarity/sessions?projectId=urzs0mg9yx&limit=20` - Sessões recentes

---

## 🐛 Debug

### Testar se variáveis estão carregando:
```csharp
// Adicionar temporariamente no Program.cs após Env.Load():
Console.WriteLine($"CLARITY_API_TOKEN: {Environment.GetEnvironmentVariable("CLARITY_API_TOKEN")?.Substring(0, 20)}...");
Console.WriteLine($"CLARITY_PROJECT_ID: {Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID")}");
```

### Testar endpoint do Clarity:
```bash
curl http://localhost:5136/api/dashboard/clarity/metrics?projectId=urzs0mg9yx&days=7
```

---

## 📝 Checklist de Validação

- [ ] API inicia sem erros
- [ ] Variáveis de ambiente carregadas corretamente
- [ ] Frontend conecta com script do Clarity
- [ ] Endpoints de analytics funcionando
- [ ] Endpoints do Clarity retornando dados (ou fallback)
- [ ] AdminDashboard renderiza sem erros
- [ ] Rota `/admin/analytics` acessível

---

Vou corrigir o código agora! 🚀

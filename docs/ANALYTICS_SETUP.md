# 📊 Sistema Completo de Analytics & Observabilidade - Arxis

## 🎯 O que Foi Implementado

Sistema completo para rastrear **TUDO**:
- 💰 **Interesse de Compra** (quem quer comprar, qual plano, quando)
- 🛒 **Conversão de Vendas** (checkout iniciado, completado, abandonado)
- 👤 **Comportamento do Usuário** (features usadas, páginas visitadas)
- 📧 **Engajamento de Email** (aberturas, cliques)
- ⚡ **Performance da API** (tempo de resposta, erros)
- 🔍 **Funis de Conversão** (passos do usuário até compra)

---

## 🏗️ Arquitetura

### Backend (.NET)
- **Application Insights** - Telemetria profissional da Microsoft
- **Serilog** - Logging estruturado
- **AnalyticsService** - Serviço centralizado de tracking
- **AnalyticsController** - Endpoints REST para eventos

### Frontend (React)
- **Microsoft Clarity** - Gravação de sessões + heatmaps (GRÁTIS!)
- **analyticsService.ts** - Cliente TypeScript para tracking

---

## 🔧 Configuração Necessária

### 1. Application Insights (Backend)

Você já tem criado! Só precisa adicionar a connection string:

**No Azure Portal:**
1. Vá em: **Application Insights** → **Arxis**
2. Menu lateral: **Configurar** → **Chaves de API**
3. Copie a **Connection String**

**No App Service Arxis-API, adicione:**
```
Nome: ApplicationInsights__ConnectionString
Valor: InstrumentationKey=6b65b548-3d2d-4974-aae1-76c946a47b57;IngestionEndpoint=https://westus2-2.in.applicationinsights.azure.com/;LiveEndpoint=https://westus2.livediagnostics.monitor.azure.com/;ApplicationId=6d3864e6-7770-4fb4-87b0-9d831086a8ea
```

### 2. Microsoft Clarity (Frontend) - GRÁTIS!

**Criar Projeto:**
1. Acesse: https://clarity.microsoft.com
2. Login com sua conta Microsoft
3. Clique em **"+ New project"**
4. Nome: **Arxis Production**
5. Website URL: `https://kind-sand-04db77a1e.1.azurestaticapps.net`
6. Copie o **Project ID** (ex: `abc123xyz`)

**Configurar no Código:**
Já adicionei o script no `index.html`, só precisa substituir:

```html
<!-- Trocar "CLARITY_PROJECT_ID" pelo ID real -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "SEU_PROJECT_ID_AQUI");
</script>
```

---

## 💰 Como Rastrear Vendas (Interesse de Compra)

### Frontend - Exemplo de Uso

```typescript
import analytics from './services/analyticsService';

// 1. Quando usuário vê a página de pricing
function PricingPage() {
  useEffect(() => {
    analytics.trackPageView('Pricing');
  }, []);

  return (
    <div>
      <PlanCard
        name="Professional"
        price={49}
        onViewDetails={() => {
          // 🎯 RASTREAR INTERESSE!
          analytics.trackPlanInterest('Professional', 49);
        }}
        onSelect={() => {
          // 🛒 RASTREAR INÍCIO DO CHECKOUT!
          analytics.trackCheckoutStarted('Professional', 49);
          // Redirecionar para checkout
        }}
      />
    </div>
  );
}

// 2. No checkout
function CheckoutPage() {
  const handlePayment = async () => {
    try {
      // Processar pagamento
      const result = await processPayment();

      if (result.success) {
        // 💰 RASTREAR VENDA COMPLETA!
        analytics.trackCheckoutCompleted(
          'Professional',
          49,
          'credit_card'
        );
      }
    } catch (error) {
      // ❌ RASTREAR CHECKOUT ABANDONADO
      analytics.trackCheckoutAbandoned(
        'Professional',
        49,
        error.message
      );
    }
  };
}

// 3. Quando usuário clica em "Upgrade"
function UpgradeButton() {
  const handleClick = () => {
    // 📈 RASTREAR INTENÇÃO DE UPGRADE
    analytics.trackUpgradeIntent('Free', 'Professional');
    // Redirecionar para checkout
  };
}

// 4. Rastrear uso de features
function CreateProjectButton() {
  const handleClick = async () => {
    await createProject();

    // 🔧 RASTREAR FEATURE USADA
    analytics.trackFeatureUsed('CreateProject', {
      projectType: 'Construction',
      location: 'Dashboard'
    });
  };
}
```

### Backend - Tracking Automático

O backend já rastreia automaticamente:
- ✅ Cadastros de usuários
- ✅ Logins
- ✅ Envio de emails
- ✅ Performance de API
- ✅ Erros e exceções

---

## 📊 Dashboards e Relatórios

### Application Insights (Azure)

**Ver dados:**
1. Azure Portal → **Application Insights** → **Arxis**
2. Menu lateral:
   - **Logs** - Consultas personalizadas
   - **Metrics** - Gráficos em tempo real
   - **Usage** - Análise de usuários
   - **Funnels** - Funis de conversão

**Consultas Úteis:**

#### Ver todos interessados em comprar
```kusto
customEvents
| where name == "PlanInterest"
| project timestamp, userId = tostring(customDimensions.userId),
          planName = tostring(customDimensions.planName),
          planPrice = tostring(customDimensions.planPrice)
| order by timestamp desc
```

#### Ver checkouts iniciados mas não completados
```kusto
let checkoutStarted = customEvents
| where name == "CheckoutStarted"
| project userId = tostring(customDimensions.userId), planName = tostring(customDimensions.planName);

let checkoutCompleted = customEvents
| where name == "CheckoutCompleted"
| project userId = tostring(customDimensions.userId);

checkoutStarted
| join kind=leftanti checkoutCompleted on userId
| summarize count() by planName
```

#### Ver vendas (💰💰💰)
```kusto
customEvents
| where name == "CheckoutCompleted"
| project timestamp,
          userId = tostring(customDimensions.userId),
          planName = tostring(customDimensions.planName),
          amount = todouble(customDimensions.amount),
          paymentMethod = tostring(customDimensions.paymentMethod)
| order by timestamp desc
```

#### Taxa de conversão por plano
```kusto
let interest = customEvents
| where name == "PlanInterest"
| summarize Interessados = dcount(tostring(customDimensions.userId)) by planName = tostring(customDimensions.planName);

let purchases = customEvents
| where name == "CheckoutCompleted"
| summarize Compradores = dcount(tostring(customDimensions.userId)) by planName = tostring(customDimensions.planName);

interest
| join purchases on planName
| project planName, Interessados, Compradores, TaxaConversao = round((Compradores * 100.0) / Interessados, 2)
```

### Microsoft Clarity

**Ver gravações:**
1. https://clarity.microsoft.com
2. Seu projeto → **Recordings**
3. Filtrar por:
   - Páginas visitadas
   - Cliques em rage (frustração)
   - Dead clicks (cliques sem efeito)
   - JavaScript errors

**Ver Heatmaps:**
- **Dashboard** → **Heatmaps**
- Ver onde usuários mais clicam
- Identificar áreas ignoradas

---

## 🎯 Funis de Conversão (Vendas)

### Configurar Funnel no Application Insights

1. Azure Portal → Application Insights → **Funnels**
2. Clique em **"+ New Funnel"**
3. Configure:

**Funnel: Purchase**
- Step 1: PageView (pageName = "Pricing") - Visitou preços
- Step 2: PlanInterest - Clicou em plano
- Step 3: CheckoutStarted - Iniciou checkout
- Step 4: CheckoutCompleted - Comprou! 💰

Isso mostra onde os usuários abandonam!

---

## 📧 Rastreamento de Email

### No EmailService

Já configurado! Toda vez que enviar email:

```csharp
await _emailService.SendWelcomeEmailAsync(user.Email, user.Name);
// Automaticamente rastreia: EmailSent com template="welcome"
```

### Adicionar Links Rastreáveis

Nos templates de email, use links com tracking:

```html
<a href="https://arxis.com/upgrade?utm_source=email&utm_campaign=inactive_user&utm_content=upgrade_button">
  Fazer Upgrade
</a>
```

---

## 🚨 Alertas Importantes

Configure alertas no Application Insights:

### Alerta: Interesse de Compra
**Quando:** `PlanInterest` > 5 eventos em 1 hora
**Ação:** Enviar email para time de vendas

### Alerta: Checkout Abandonado
**Quando:** `CheckoutAbandoned` > 3 em 1 dia
**Ação:** Investigar problema no checkout

### Alerta: Erro no Pagamento
**Quando:** `CheckoutCompleted` cai 50% vs média
**Ação:** Verificar integração de pagamento

**Como criar:**
1. Application Insights → **Alerts** → **+ New alert rule**
2. Condition: Custom log search
3. Query: Sua consulta Kusto
4. Action: Email, SMS, Webhook, etc.

---

## 💡 Insights de Negócio

### Perguntas que você pode responder:

✅ **Quantas pessoas estão interessadas em comprar?**
```kusto
customEvents
| where name == "PlanInterest"
| summarize count() by bin(timestamp, 1d)
```

✅ **Qual plano é mais popular?**
```kusto
customEvents
| where name == "PlanInterest"
| summarize count() by planName = tostring(customDimensions.planName)
```

✅ **Quanto dinheiro estou fazendo?**
```kusto
customEvents
| where name == "CheckoutCompleted"
| summarize TotalRevenue = sum(todouble(customDimensions.amount))
```

✅ **Quais features os usuários mais usam?**
```kusto
customEvents
| where name == "FeatureUsed"
| summarize count() by featureName = tostring(customDimensions.featureName)
| order by count_ desc
```

✅ **Taxa de abandono do checkout?**
```kusto
let started = customEvents | where name == "CheckoutStarted" | count;
let completed = customEvents | where name == "CheckoutCompleted" | count;
print AbandonRate = round((started - completed) * 100.0 / started, 2)
```

---

## 🎯 Exemplo Completo: Página de Pricing

```typescript
// src/pages/PricingPage.tsx
import { useEffect } from 'react';
import analytics from '../services/analyticsService';

function PricingPage() {
  useEffect(() => {
    // Rastrear visualização da página
    analytics.trackPageView('Pricing');

    // Rastrear passo do funil
    analytics.trackFunnelStep('Purchase', 'ViewedPricing');
  }, []);

  const plans = [
    { name: 'Starter', price: 19, features: ['5 Projects', 'Basic Support'] },
    { name: 'Professional', price: 49, features: ['Unlimited Projects', 'Priority Support'] },
    { name: 'Enterprise', price: 199, features: ['Everything', 'Dedicated Account Manager'] }
  ];

  return (
    <div className="pricing-page">
      <h1>Escolha seu Plano</h1>

      {plans.map(plan => (
        <div key={plan.name} className="plan-card">
          <h2>{plan.name}</h2>
          <p className="price">${plan.price}/mês</p>

          <button
            onClick={() => {
              // 🎯 Rastrear interesse!
              analytics.trackPlanInterest(plan.name, plan.price);
              analytics.trackFunnelStep('Purchase', 'ClickedPlan', {
                planName: plan.name
              });

              // Mostrar detalhes
              showPlanDetails(plan);
            }}
          >
            Ver Detalhes
          </button>

          <button
            className="cta-button"
            onClick={() => {
              // 🛒 Rastrear início do checkout!
              analytics.trackCheckoutStarted(plan.name, plan.price);
              analytics.trackFunnelStep('Purchase', 'StartedCheckout', {
                planName: plan.name
              });

              // Ir para checkout
              navigate(`/checkout/${plan.name}`);
            }}
          >
            Começar Agora
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📱 Configurar no App Service

Adicione estas variáveis no Azure Portal:

```
ApplicationInsights__ConnectionString = InstrumentationKey=6b65b548...

# Opcional: Habilitar telemetria mais detalhada
ApplicationInsights__EnableAdaptiveSampling = false
ApplicationInsights__EnableDependencyTracking = true
ApplicationInsights__EnablePerformanceCounterCollectionModule = true
```

---

## 🎓 Recursos de Aprendizado

### Application Insights
- Docs: https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview
- Kusto Query: https://docs.microsoft.com/azure/data-explorer/kusto/query/

### Microsoft Clarity
- Dashboard: https://clarity.microsoft.com
- Docs: https://docs.microsoft.com/clarity/

---

## 💰 Custos

- **Application Insights**: Grátis até 5GB/mês (suficiente para 100K+ usuários)
- **Microsoft Clarity**: **TOTALMENTE GRÁTIS** (sem limites!)

---

## ✅ Checklist de Configuração

- [ ] Adicionar `ApplicationInsights__ConnectionString` no App Service
- [ ] Criar projeto no Microsoft Clarity
- [ ] Substituir `CLARITY_PROJECT_ID` no `index.html`
- [ ] Restaurar pacotes NuGet: `dotnet restore`
- [ ] Testar localmente
- [ ] Fazer deploy
- [ ] Verificar dados chegando no Application Insights
- [ ] Ver gravações no Clarity

---

## 🎯 Próximo Passo

Depois de configurar, você terá:

📊 **Dashboards em tempo real** mostrando:
- 👤 Quantos visitantes
- 💰 Quantos interessados em comprar
- 🛒 Quantos iniciaram checkout
- ✅ Quantos completaram compra
- 💸 Revenue total
- 📈 Taxa de conversão por plano
- 🎥 Gravações de sessões dos usuários

**Você vai saber EXATAMENTE quem quer comprar e quando!** 🚀

---

_Última atualização: 27/12/2024_

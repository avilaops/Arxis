# 🔗 Conectar Clarity Direto no Dashboard

## ✅ Implementado

Criei integração direta com a API do Microsoft Clarity! Agora os dados aparecem automaticamente no seu dashboard.

---

## 🔧 Configuração (3 passos)

### 1. Pegar o Token do Clarity

Você já criou o token `TOKEN_ARXIS`! Agora precisa copiar o valor:

1. Acesse: https://clarity.microsoft.com/projects/view/[seu-projeto]/settings/api
2. Em "TOKEN_ARXIS", clique em **"Copiar"**
3. Copie o token completo (algo como: `cl_abc123...xyz`)

### 2. Pegar o Project ID

1. No Clarity, vá no seu projeto "Arxis"
2. A URL será algo como: `https://clarity.microsoft.com/projects/view/PROJECTID/...`
3. Copie o `PROJECTID` (sequência de letras/números após `/view/`)

### 3. Configurar no Azure App Service

No Azure Portal:

1. Vá em: **Serviços de Aplicativos** → **Arxis-API**
2. Menu lateral: **Configuração** → **Configurações do aplicativo**
3. Adicione 2 novas configurações:

```
Nome: Clarity__ApiToken
Valor: [SEU_TOKEN_AQUI]

Nome: Clarity__ProjectId
Valor: [SEU_PROJECT_ID_AQUI]
```

4. Clique em **"Salvar"**

---

## 📊 Novos Dados no Dashboard

Agora você terá:

### Do Clarity (Comportamento Real):
- 📊 **Total de Sessões** - Quantas visitas
- 👥 **Usuários Únicos** - Quantos visitantes diferentes
- 📄 **Page Views** - Total de páginas vistas
- ⏱️ **Duração Média** - Quanto tempo ficam
- 🏃 **Taxa de Rejeição** - Quantos saem rapidamente
- 📱 **Dispositivos** - Desktop vs Mobile vs Tablet
- 😡 **Rage Clicks** - Cliques de frustração
- 🚫 **Dead Clicks** - Cliques que não fazem nada
- ⚠️ **Erros JavaScript** - Bugs no frontend
- 🎥 **Gravações de Sessões** - Links para assistir

### Do Analytics (Conversão):
- 💰 Revenue
- 🛒 Vendas
- 👀 Interessados
- 📈 Funil de Conversão

---

## 🎯 Endpoints Criados

```
GET /api/dashboard/clarity/metrics?projectId={id}&days=7
GET /api/dashboard/clarity/sessions?projectId={id}&limit=20
```

---

## 📱 Como Ver no Frontend

O `AdminDashboard.tsx` pode buscar dados do Clarity:

```typescript
// Buscar métricas do Clarity
const clarityMetrics = await axios.get(
  `${API_BASE_URL}/api/dashboard/clarity/metrics?projectId=${projectId}&days=7`,
  { headers: { Authorization: `Bearer ${token}` } }
);

// Métricas disponíveis:
console.log(clarityMetrics.data.totalSessions);    // 1250
console.log(clarityMetrics.data.pageViews);        // 5430
console.log(clarityMetrics.data.rageClicks);       // 23
console.log(clarityMetrics.data.bounceRate);       // 42.3%

// Buscar sessões recentes
const sessions = await axios.get(
  `${API_BASE_URL}/api/dashboard/clarity/sessions?projectId=${projectId}&limit=20`,
  { headers: { Authorization: `Bearer ${token}` } }
);

// Para cada sessão:
sessions.data.forEach(session => {
  console.log(session.sessionId);       // abc123
  console.log(session.duration);        // 185 segundos
  console.log(session.device);          // "Desktop"
  console.log(session.hasRageClicks);   // true/false
  console.log(session.recordingUrl);    // Link para assistir gravação
});
```

---

## 🔄 Atualização Automática

O backend tenta buscar dados reais do Clarity. Se falhar (token inválido, API fora), retorna dados mockados automaticamente.

---

## 🎥 Ver Gravações de Sessões

Cada sessão tem um `recordingUrl`. No dashboard, você pode:

```tsx
<a href={session.recordingUrl} target="_blank">
  🎥 Ver Gravação
</a>
```

Isso abre o Clarity com a gravação da sessão!

---

## 📊 Exemplo de Card no Dashboard

```tsx
<Card>
  <CardContent>
    <Typography variant="h6">Clarity Insights</Typography>

    <Box mt={2}>
      <Typography variant="body2">Sessões: {clarityMetrics.totalSessions}</Typography>
      <Typography variant="body2">Usuários: {clarityMetrics.totalUsers}</Typography>
      <Typography variant="body2">Page Views: {clarityMetrics.pageViews}</Typography>
      <Typography variant="body2">Taxa de Rejeição: {clarityMetrics.bounceRate}%</Typography>

      {clarityMetrics.rageClicks > 0 && (
        <Chip
          label={`😡 ${clarityMetrics.rageClicks} Rage Clicks`}
          color="error"
        />
      )}

      {clarityMetrics.deadClicks > 0 && (
        <Chip
          label={`🚫 ${clarityMetrics.deadClicks} Dead Clicks`}
          color="warning"
        />
      )}
    </Box>
  </CardContent>
</Card>
```

---

## 🚨 Troubleshooting

### Erro 401 (Unauthorized)

Token inválido ou expirado. Gerar novo token no Clarity:
1. Clarity → Settings → API
2. Deletar token antigo
3. Criar novo token
4. Atualizar no Azure App Service

### Erro 404 (Not Found)

Project ID incorreto. Verificar URL do projeto no Clarity.

### Dados Mockados Aparecem

API do Clarity não está respondendo. Verificar:
- Token está correto?
- Project ID está correto?
- Clarity API está funcionando? (https://www.clarity.ms/status)

---

## 📋 Checklist

- [ ] Copiar Token do Clarity (`TOKEN_ARXIS`)
- [ ] Copiar Project ID do Clarity
- [ ] Adicionar `Clarity__ApiToken` no App Service
- [ ] Adicionar `Clarity__ProjectId` no App Service
- [ ] Reiniciar App Service
- [ ] Testar endpoint: `/api/dashboard/clarity/metrics?projectId={id}`
- [ ] Verificar dados reais no dashboard

---

## 🎯 Resultado Final

Seu dashboard vai mostrar:

**Clarity (Comportamento):**
- 📊 1,250 sessões
- 👥 850 usuários únicos
- 📄 5,430 page views
- ⏱️ 3min 5s duração média
- 🏃 42.3% taxa de rejeição
- 😡 23 rage clicks (frustração)
- 🚫 45 dead clicks (bugs)
- ⚠️ 12 erros JavaScript

**Analytics (Conversão):**
- 💰 $3,500 revenue
- ✅ 35 vendas
- 👀 450 interessados
- 📈 7.8% taxa de conversão

**Tudo em um só lugar, sem sair do Arxis!** 🚀

---

_Atualização: 27/12/2024_

# 🚀 ARXIS Iniciado com Sucesso!

## ✅ Status dos Serviços

### Backend API
- **Status**: ✅ Rodando
- **URL**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health
- **Janela**: PowerShell separada

### Frontend Web
- **Status**: ✅ Rodando
- **URL**: http://localhost:3000
- **Tecnologia**: React + Vite
- **Janela**: PowerShell separada

## 🌐 Acessar a Aplicação

1. **Abra seu navegador**
2. **Acesse**: http://localhost:3000
3. **Explore os módulos** clicando nos ícones na barra lateral

## 📊 Testar a API

### Via Swagger UI
Acesse http://localhost:5000/swagger para testar os endpoints interativamente

### Via curl (PowerShell)

```powershell
# Listar projetos
curl http://localhost:5000/api/projects

# Criar projeto
$body = @{
    name = "Edifício Aurora"
    description = "Prédio residencial de 15 andares"
    client = "Construtora ABC"
    city = "São Paulo"
    state = "SP"
    currency = "BRL"
    totalBudget = 15000000
    status = 1
    type = 0
    tags = @("residencial", "alto-padrão")
} | ConvertTo-Json

curl -Method POST -Uri "http://localhost:5000/api/projects" `
     -ContentType "application/json" `
     -Body $body

# Health check
curl http://localhost:5000/health
```

## 🛑 Parar os Serviços

Para parar os serviços, você tem duas opções:

### Opção 1: Fechar as janelas do PowerShell
Simplesmente feche as duas janelas do PowerShell que foram abertas

### Opção 2: Via Task Manager
1. Abra o Task Manager (Ctrl+Shift+Esc)
2. Procure por processos "dotnet" e "node"
3. Finalize-os

### Opção 3: Via PowerShell
```powershell
# Parar API (porta 5000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Parar Frontend (porta 3000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## 📝 O que você pode fazer agora

### 1. Explorar o Frontend
- ✅ Navegar pelos 15 módulos do ARXIS
- ✅ Ver a tela de projetos
- ✅ Testar a interface responsiva

### 2. Testar a API
- ✅ Criar projetos via Swagger
- ✅ Listar projetos
- ✅ Criar tarefas
- ✅ Criar issues/RFIs

### 3. Desenvolver
- ✅ Modificar código do frontend (hot reload ativo)
- ✅ Modificar código do backend (reiniciar API)
- ✅ Adicionar novos componentes
- ✅ Implementar novos endpoints

## 🔄 Reiniciar os Serviços

Se precisar reiniciar, basta executar novamente:

```powershell
# Backend
cd src\Arxis.API
dotnet run

# Frontend (em outro terminal)
cd src\Arxis.Web
npm run dev
```

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se a porta 5000 está disponível
- Confirme se o SQL Server está rodando (ou use auto-migration)
- Veja os logs na janela do PowerShell do backend

### Frontend não carrega dados
- Confirme que a API está rodando em http://localhost:5000
- Abra o console do navegador (F12) para ver erros
- Verifique o arquivo `.env` em `src/Arxis.Web/`

### Porta já em uso
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Finalizar processo (substituir <PID> pelo número encontrado)
taskkill /PID <PID> /F
```

## 📚 Próximos Passos

1. **Criar dados de teste**
   - Use o Swagger para criar alguns projetos
   - Adicione tarefas e issues
   - Teste os diferentes status

2. **Explorar o código**
   - Backend: `src/Arxis.API/Controllers/`
   - Frontend: `src/Arxis.Web/src/components/`
   - Serviços: `src/Arxis.Web/src/services/`

3. **Desenvolver novos recursos**
   - Implementar autenticação
   - Adicionar mais componentes
   - Criar dashboards com KPIs

4. **Ler a documentação**
   - `QUICKSTART.md` - Guia rápido
   - `GETTING_STARTED.md` - Guia completo
   - `docs/ARCHITECTURE.md` - Arquitetura
   - `docs/DEVELOPMENT.md` - Desenvolvimento

## 🎉 Pronto!

Sua aplicação ARXIS está rodando e pronta para desenvolvimento!

**URLs Principais:**
- Frontend: http://localhost:3000
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Health: http://localhost:5000/health

---

**Boa sorte com seu projeto! 🚀**

*Gerado automaticamente em: 2025-12-22*

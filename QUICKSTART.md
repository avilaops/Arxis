# 🚀 Quick Start - ARXIS

Este guia irá te ajudar a iniciar o projeto ARXIS em menos de 5 minutos!

## ✅ Pré-requisitos

Certifique-se de ter instalado:
- ✅ [.NET 10 SDK](https://dotnet.microsoft.com/download)
- ✅ [Node.js 20+](https://nodejs.org/)
- ✅ [SQL Server](https://www.microsoft.com/sql-server) ou Docker

## 🎯 Opção 1: Início Rápido com Docker (Recomendado)

### 1. Clonar e iniciar

```bash
# Clone o repositório
git clone https://github.com/your-org/arxis.git
cd arxis

# Iniciar todos os serviços
docker-compose up -d
```

### 2. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

### 3. Ver logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f web
```

### 4. Parar os serviços

```bash
docker-compose down
```

## 🛠️ Opção 2: Desenvolvimento Local

### 1. Instalar dependências

```bash
# Backend
dotnet restore

# Frontend
cd src/Arxis.Web
npm install
cd ../..
```

### 2. Configurar banco de dados

#### 2.1. Atualizar Connection String

Edite `src/Arxis.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ArxisDb;User Id=sa;Password=SUA_SENHA;TrustServerCertificate=True;"
  }
}
```

#### 2.2. Aplicar Migrations

```bash
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### 3. Iniciar os serviços

#### Terminal 1 - Backend

```bash
cd src/Arxis.API
dotnet run
```

Aguarde até ver:
```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

#### Terminal 2 - Frontend

```bash
cd src/Arxis.Web
npm run dev
```

Aguarde até ver:
```
  VITE v6.0.7  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h + enter to show help
```

### 4. Abrir no navegador

Acesse: http://localhost:3000

## 📊 Testando a API

### Swagger UI

Acesse http://localhost:5000/swagger para testar os endpoints diretamente no navegador.

### Criar um projeto de teste

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Edifício Residencial Aurora",
    "description": "Prédio residencial de 15 andares",
    "client": "Construtora XYZ",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "currency": "BRL",
    "totalBudget": 15000000,
    "status": 1,
    "type": 0,
    "tags": ["residencial", "alto-padrão"]
  }'
```

### Listar projetos

```bash
curl http://localhost:5000/api/projects
```

## 🔧 Comandos Úteis

### Backend

```bash
# Build
dotnet build

# Executar com hot reload
cd src/Arxis.API
dotnet watch run

# Criar nova migration
dotnet ef migrations add <NomeDaMigration> --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Aplicar migrations
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Reverter última migration
dotnet ef migrations remove --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### Frontend

```bash
cd src/Arxis.Web

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Parar e remover volumes (apaga dados)
docker-compose down -v
```

## 🐛 Troubleshooting

### Porta já em uso

**Backend (5000)**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

**Frontend (3000)**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Erro de conexão com banco de dados

1. Verifique se o SQL Server está rodando
2. Confirme a connection string em `appsettings.json`
3. Verifique as credenciais (usuário e senha)
4. Execute as migrations novamente

### Frontend não carrega dados

1. Verifique se a API está rodando em http://localhost:5000
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique o arquivo `.env` em `src/Arxis.Web/`
4. Teste a API diretamente no Swagger

### Migrations pendentes

```bash
# Ver migrations pendentes
dotnet ef migrations list --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Aplicar todas as migrations
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Resetar banco (CUIDADO: apaga todos os dados)
dotnet ef database drop --project src/Arxis.Infrastructure --startup-project src/Arxis.API --force
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

## 📚 Próximos Passos

1. ✅ Explore a API no Swagger: http://localhost:5000/swagger
2. ✅ Crie alguns projetos de teste
3. ✅ Navegue pelos diferentes módulos no frontend
4. ✅ Leia a documentação completa em `/docs`
5. ✅ Configure autenticação (próxima feature)

## 🆘 Precisa de ajuda?

- 📖 Documentação completa: [GETTING_STARTED.md](GETTING_STARTED.md)
- 🏗️ Arquitetura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 💻 Guia de desenvolvimento: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/arxis/issues)
- 💬 Email: support@arxis.com

---

**Boa sorte com seu projeto! 🚀**

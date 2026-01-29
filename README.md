# 🚀 ARXIS - Sistema de Gerenciamento de Obras

[![CI/CD](https://github.com/your-org/arxis/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-org/arxis/actions)
[![codecov](https://codecov.io/gh/your-org/arxis/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/arxis)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

> Plataforma profissional de gerenciamento de obras de engenharia com Clean Architecture, microsserviços ready e observabilidade completa.

## ⚡ Quick Start

**Rode o projeto completo com UM único comando:**

```bash
# Windows
.\start.ps1

# Linux/Mac
./start.sh

# Ou direto com Docker Compose
docker-compose up --build -d
```

**Pronto!** Acesse:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:5000
- 📚 **Swagger**: http://localhost:5000/swagger

📖 **Mais detalhes**: [QUICK_START.md](QUICK_START.md)

---

## 📋 Sumário

- [Características](#-características)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Características

### Backend (.NET 8.0)
- ✅ **Clean Architecture** - Separação clara de responsabilidades
- ✅ **JWT Authentication** - Autenticação segura com tokens
- ✅ **Entity Framework Core** - ORM moderno com migrations
- ✅ **Redis Cache** - Cache distribuído com fallback in-memory
- ✅ **Rate Limiting** - Proteção contra abuso (60 req/min)
- ✅ **Serilog** - Logging estruturado multi-sink
- ✅ **Health Checks** - Monitoramento de saúde do sistema
- ✅ **Swagger/OpenAPI** - Documentação interativa de API
- ✅ **Application Insights** - Telemetria e monitoring
- ✅ **FluentValidation** - Validação declarativa de dados
- ✅ **Docker Ready** - Containerização multi-stage

### Frontend (React 18 + TypeScript)
- ✅ **React 18.3** - UI moderna e responsiva
- ✅ **TypeScript** - Type-safety em todo código
- ✅ **Material-UI** - Componentes visuais consistentes
- ✅ **React Query** - State management e cache inteligente
- ✅ **Vite** - Build ultra-rápido (< 2s)
- ✅ **React Router** - Roteamento client-side
- ✅ **Axios** - Cliente HTTP com interceptors

### DevOps & Qualidade
- ✅ **CI/CD** - GitHub Actions com deploy automatizado
- ✅ **Testes Automatizados** - xUnit + Moq + FluentAssertions
- ✅ **Code Coverage** - Integração com Codecov
- ✅ **Security Scan** - Trivy para vulnerabilidades
- ✅ **Multi-environment** - Dev, Staging, Production
- ✅ **Observability** - Logs, Metrics, Traces

## 🏗️ Arquitetura

```
Arxis/
├── src/
│   ├── Arxis.API/              # Camada de API (Controllers, Middleware)
│   │   ├── Controllers/        # Endpoints REST
│   │   ├── Services/           # Lógica de aplicação
│   │   ├── HealthChecks/       # Health checks customizados
│   │   └── Middleware/         # Error handling, logging
│   ├── Arxis.Domain/           # Entidades e regras de negócio
│   │   ├── Entities/           # Entidades do domínio
│   │   └── Common/             # Base classes
│   ├── Arxis.Infrastructure/   # Persistência e externos
│   │   └── Data/               # DbContext, Repositories
│   └── Arxis.Web/              # Frontend React
│       ├── src/
│       │   ├── components/     # Componentes reutilizáveis
│       │   ├── pages/          # Páginas da aplicação
│       │   ├── services/       # Integração com API
│       │   └── context/        # Context API (Auth, etc)
│       └── package.json
├── tests/
│   ├── Arxis.Domain.Tests/     # Testes unitários do domínio
│   └── Arxis.API.Tests/        # Testes de integração da API
├── docs/                        # Documentação completa
├── .github/workflows/           # CI/CD pipelines
└── Dockerfile                   # Multi-stage build
```

### Fluxo de Dados

```
┌─────────┐      ┌─────────┐      ┌──────────────┐      ┌──────────┐
│ Cliente │ ───> │ Nginx   │ ───> │  API (.NET)  │ ───> │ Database │
│  React  │      │ (Port   │      │  (Port 5000) │      │ (SQLite/ │
│         │ <─── │  80)    │ <─── │              │ <─── │  SQL Srv)│
└─────────┘      └─────────┘      └──────────────┘      └──────────┘
                                           │
                                           ├───> Redis Cache
                                           ├───> App Insights
                                           └───> File Storage
```

## 📦 Pré-requisitos

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) e npm
- [Docker](https://www.docker.com/) (opcional, para containerização)
- [Redis](https://redis.io/) (opcional, para cache distribuído)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) ou [VS Code](https://code.visualstudio.com/)

## 🚀 Instalação e Execução

### Opção 1: Docker Compose (RECOMENDADO) 🐳

A maneira mais fácil de rodar o projeto completo com **UM ÚNICO COMANDO**:

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

Ou diretamente:
```bash
# Produção (otimizado)
docker-compose up --build -d

# Desenvolvimento (com hot-reload)
docker-compose -f docker-compose.dev.yml up --build
```

**Pronto!** A aplicação completa estará rodando:
- 🌐 **Frontend**: http://localhost:3000 (produção) ou http://localhost:5173 (dev)
- 🔌 **API**: http://localhost:5000
- 📚 **Swagger**: http://localhost:5000/swagger
- 📊 **Redis**: localhost:6379

---

### Opção 2: Execução Manual (para desenvolvimento avançado)

#### 1. Clone o repositório

```bash
git clone https://github.com/your-org/arxis.git
cd arxis
```

#### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
ConnectionStrings__DefaultConnection=Data Source=arxis.db

# JWT
Jwt__Secret=SuaChaveSecretaMuitoSeguraComPeloMenos32Caracteres123456
Jwt__Issuer=ArxisAPI
Jwt__Audience=ArxisWeb

# Redis (opcional)
Redis__ConnectionString=localhost:6379
Redis__Enabled=false

# Application Insights (opcional)
ApplicationInsights__ConnectionString=InstrumentationKey=your-key-here

# Microsoft Clarity (opcional)
CLARITY_API_TOKEN=your-clarity-token
CLARITY_PROJECT_ID=your-project-id

# CORS
Cors__AllowedOrigins__0=http://localhost:3000
Cors__AllowedOrigins__1=http://localhost:5173
```

#### 3. Instale as dependências

##### Backend
```bash
dotnet restore
```

##### Frontend
```bash
cd src/Arxis.Web
npm install
```

#### 4. Execute o projeto

##### Terminal 1 - Backend
```bash
dotnet run --project src/Arxis.API
```

##### Terminal 2 - Frontend
```bash
cd src/Arxis.Web
npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

---

## ⚙️ Configuração

### Banco de Dados

Execute as migrations para criar o banco:

```bash
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### Email (opcional)

Configure SMTP no `appsettings.json`:

```json
{
  "Email": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "UseSsl": true,
    "FromEmail": "noreply@arxis.com",
    "FromName": "ARXIS",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

## 💻 Uso

### Desenvolvimento Local

#### Backend (API)
```bash
cd src/Arxis.API
dotnet run
```

API estará disponível em: `https://localhost:5001`
Swagger UI: `https://localhost:5001/swagger`

#### Frontend (React)
```bash
cd src/Arxis.Web
npm run dev
```

Frontend estará disponível em: `http://localhost:5173`

### Docker Compose

```bash
docker-compose up -d
```

Serviços disponíveis:
- **API**: http://localhost:5000
- **Web**: http://localhost:80
- **Redis**: localhost:6379

## 🧪 Testes

### Executar todos os testes

```bash
dotnet test
```

### Testes com coverage

```bash
dotnet test --collect:"XPlat Code Coverage"
```

### Testes específicos

```bash
# Testes de domínio
dotnet test tests/Arxis.Domain.Tests

# Testes de integração
dotnet test tests/Arxis.API.Tests
```

## 🚢 Deploy

### Azure

1. Configure os secrets no GitHub:
   - `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING`
   - `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

2. Push para o branch apropriado:
   ```bash
   git push origin develop  # Deploy para staging
   git push origin main     # Deploy para production
   ```

### Manual

```bash
# Build
dotnet publish src/Arxis.API -c Release -o ./publish

# Deploy (exemplo Azure)
az webapp deployment source config-zip \
  --resource-group arxis-rg \
  --name arxis-api \
  --src ./publish.zip
```

## 📊 Monitoramento

### Health Checks

- **Liveness**: `/health/live`
- **Readiness**: `/health/ready`
- **Completo**: `/health`

Exemplo de resposta:
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0234567",
  "entries": {
    "self": { "status": "Healthy" },
    "database": { "status": "Healthy" },
    "memory": { "status": "Healthy", "data": { "AllocatedMB": 45 } },
    "diskspace": { "status": "Healthy", "data": { "FreeSpaceGB": 120.5 } }
  }
}
```

### Logs

Logs são salvos em:
- Console (desenvolvimento)
- Arquivo: `logs/arxis-{date}.log` (rotação diária)
- Application Insights (produção)

Formato estruturado:
```
[10:30:45 INF] HTTP GET /api/projects responded 200 in 45.23 ms
```

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Guidelines

- Siga os padrões de código (EditorConfig incluído)
- Escreva testes para novas funcionalidades
- Atualize a documentação quando necessário
- Mantenha commits atômicos e descritivos

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Microsoft](https://microsoft.com) - .NET e Azure
- [React Team](https://reactjs.org/) - React framework
- [Material-UI](https://mui.com/) - Componentes UI
- Comunidade open-source

---

**Desenvolvido com ❤️ pela equipe ARXIS**

🔗 Links:
- [Documentação](https://docs.arxis.com)
- [Website](https://arxis.com)
- [Issues](https://github.com/your-org/arxis/issues)
- [Discussions](https://github.com/your-org/arxis/discussions)

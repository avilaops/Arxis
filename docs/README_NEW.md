# 🏗️ ARXIS - Sistema de Gerenciamento de Obras

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/MUI-5-007FFF)](https://mui.com/)

Sistema completo de gerenciamento de obras e projetos desenvolvido pela [Avila Soluções Empresariais](https://avila.inc).

## 📋 Sumário

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Contribuição](#contribuição)
- [Suporte](#suporte)
- [Licença](#licença)

## 🎯 Sobre

ARXIS é uma plataforma moderna e completa para gerenciamento de obras, projetos e tarefas. Desenvolvida com as melhores práticas e tecnologias do mercado, oferece:

- **Dashboard Inteligente** - Visão consolidada de todos os projetos
- **Gerenciamento de Projetos** - Controle completo do ciclo de vida
- **Sistema de Tarefas** - Organização e acompanhamento de atividades
- **Controle de Issues** - Rastreamento e resolução de problemas
- **Gestão de Documentos** - Armazenamento centralizado
- **Controle de Orçamento** - Monitoramento financeiro

## 🚀 Tecnologias

### Backend
- **.NET 8** - Framework principal
- **Entity Framework Core** - ORM
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação
- **FluentValidation** - Validações
- **Swagger** - Documentação da API

### Frontend
- **React 18** - Library UI
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes UI
- **Recharts** - Gráficos e visualizações
- **React Router** - Navegação
- **Vite** - Build tool

## 📦 Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/avilaops/Arxis.git
cd Arxis
```

### 2. Backend Setup
```bash
cd src/Arxis.API
dotnet restore
dotnet ef database update
```

### 3. Frontend Setup
```bash
cd src/Arxis.Web
npm install
```

## ⚙️ Configuração

### Backend

O backend usa `appsettings.json` para configuração. Veja [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) para detalhes completos.

**Configurações principais:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=arxis.db"
  },
  "Jwt": {
    "Key": "SuaChaveSecreta",
    "Issuer": "ArxisAPI",
    "Audience": "ArxisWeb"
  }
}
```

### Frontend

Crie um arquivo `.env` na pasta `src/Arxis.Web`:

```env
VITE_API_URL=http://localhost:5000
VITE_COMPANY_NAME=Sua Empresa
VITE_APP_NAME=ARXIS
```

Use `.env.example` como template.

## 🎮 Execução

### Desenvolvimento

**Backend (Terminal 1):**
```bash
cd src/Arxis.API
dotnet run
```
API estará disponível em `http://localhost:5000`

**Frontend (Terminal 2):**
```bash
cd src/Arxis.Web
npm run dev
```
Aplicação estará disponível em `http://localhost:3000`

### Produção

**Backend:**
```bash
cd src/Arxis.API
dotnet publish -c Release
```

**Frontend:**
```bash
cd src/Arxis.Web
npm run build
```

## 📁 Estrutura do Projeto

```
Arxis/
├── src/
│   ├── Arxis.API/              # Backend API
│   │   ├── Controllers/        # Endpoints da API
│   │   ├── Models/             # DTOs e Models
│   │   ├── Services/           # Lógica de negócio
│   │   ├── Middleware/         # Middlewares personalizados
│   │   └── Configuration/      # Configurações
│   │
│   ├── Arxis.Domain/           # Camada de domínio
│   │   ├── Entities/           # Entidades do domínio
│   │   └── Common/             # Interfaces e classes base
│   │
│   ├── Arxis.Infrastructure/   # Camada de infraestrutura
│   │   ├── Data/               # DbContext e configurações
│   │   └── Migrations/         # Migrações do banco
│   │
│   └── Arxis.Web/              # Frontend React
│       ├── src/
│       │   ├── components/     # Componentes reutilizáveis
│       │   ├── pages/          # Páginas da aplicação
│       │   ├── services/       # Chamadas à API
│       │   ├── context/        # Context API (Auth, etc)
│       │   ├── config/         # Configurações
│       │   └── theme/          # Tema MUI
│       └── public/             # Assets estáticos
│
├── .env                        # Variáveis de ambiente (raiz)
├── .env.example                # Template de variáveis
├── ENVIRONMENT_SETUP.md        # Documentação de configuração
└── README.md                   # Este arquivo
```

## ✨ Features

### Dashboard
- 📊 Estatísticas em tempo real
- 📈 Gráficos interativos (Projetos, Tarefas, Issues)
- 🎯 KPIs principais (Projetos, Tarefas, Issues, Orçamento)
- 📅 Timeline de atividades recentes
- 🔄 Atualização em tempo real

### Gerenciamento de Projetos
- ✅ CRUD completo de projetos
- 📋 Múltiplos status (Planning, InProgress, OnHold, Completed)
- 💰 Controle de orçamento
- 📅 Datas de início e fim
- 🏷️ Categorização por tipo

### Sistema de Tarefas
- 📝 Criação e gerenciamento de tarefas
- ⏰ Priorização (Low, Medium, High, Critical)
- 👥 Atribuição de responsáveis
- 🔄 Workflow completo (Todo, InProgress, Review, Done)
- 📊 Rastreamento de progresso

### Controle de Issues
- 🐛 Registro e rastreamento de problemas
- 🔴 Classificação por severidade
- 💬 Sistema de comentários
- 📎 Anexos de documentos
- 🔗 Relacionamento entre issues

### Autenticação & Segurança
- 🔐 JWT Authentication
- 👤 Gerenciamento de usuários
- 🔒 Rotas protegidas
- 🛡️ Middleware de tratamento de erros

## 📚 API Documentation

Acesse a documentação Swagger da API:
```
http://localhost:5000/swagger
```

### Endpoints Principais

**Auth:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

**Dashboard:**
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/statistics/projects` - Estatísticas de projetos

**Projects:**
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/{id}` - Detalhes do projeto
- `PUT /api/projects/{id}` - Atualizar projeto
- `DELETE /api/projects/{id}` - Deletar projeto

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: [support@avila.inc](mailto:support@avila.inc)
- 🌐 Website: [https://avila.inc](https://avila.inc)
- 📚 Documentação: [https://docs.avila.inc](https://docs.avila.inc)
- 💼 LinkedIn: [Avila DevOps](https://linkedin.com/company/avila-devops)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Desenvolvido com ❤️ por [Avila Soluções Empresariais](https://avila.inc)**

[Website](https://avila.inc) • [Development](https://avilaops.com) • [Documentação](https://docs.avila.inc) • [Suporte](https://support.avila.inc)

</div>

# ARXIS - Construction Management Platform

![ARXIS Logo](https://via.placeholder.com/200x50/0078d4/ffffff?text=ARXIS)

## 🏗️ Sobre o Projeto

ARXIS é uma plataforma completa de gestão de obras que integra BIM, cronograma 4D, gestão de custos, qualidade, segurança e muito mais em uma única solução moderna e intuitiva.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Módulos](#módulos)
- [API](#api)
- [Contribuição](#contribuição)

## 🚀 Tecnologias

### Backend
- **ASP.NET Core 10.0** - Framework web
- **Entity Framework Core** - ORM
- **SQL Server** - Banco de dados
- **Swagger/OpenAPI** - Documentação da API

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Router** - Navegação
- **TanStack Query** - Data fetching

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Nginx** - Servidor web para frontend

## 🏛️ Arquitetura

O projeto segue uma arquitetura em camadas:

```
Arxis/
├── src/
│   ├── Arxis.API/              # Web API (Controllers, Middleware)
│   ├── Arxis.Domain/           # Entidades e lógica de negócio
│   ├── Arxis.Infrastructure/   # Data access e integrações
│   └── Arxis.Web/              # Frontend React
├── docs/                       # Documentação adicional
├── docker-compose.yml          # Orquestração de containers
└── README.md
```

### Camadas

#### Domain Layer (`Arxis.Domain`)
- Entidades de negócio
- Enums e value objects
- Interfaces de repositório
- Regras de negócio

#### Infrastructure Layer (`Arxis.Infrastructure`)
- Implementação do DbContext
- Repositórios
- Integrações externas (BIM, ERP, etc.)
- Migrations

#### API Layer (`Arxis.API`)
- Controllers REST
- DTOs
- Middleware
- Configuração de serviços

#### Web Layer (`Arxis.Web`)
- Componentes React
- Gerenciamento de estado
- Comunicação com API
- UI/UX

## 📦 Instalação

### Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- SQL Server (ou usar via Docker)

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/your-org/arxis.git
cd arxis
```

2. **Restaurar dependências do backend**
```bash
dotnet restore
```

3. **Instalar dependências do frontend**
```bash
cd src/Arxis.Web
npm install
```

4. **Configurar banco de dados**
```bash
# Atualizar connection string em src/Arxis.API/appsettings.json
# Criar migrations
dotnet ef migrations add InitialCreate --project src/Arxis.Infrastructure --startup-project src/Arxis.API
# Aplicar migrations
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### Instalação com Docker

```bash
# Build e executar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

Após iniciar, acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

## 💻 Desenvolvimento

### Backend

```bash
# Executar API
cd src/Arxis.API
dotnet run

# Watch mode (auto-reload)
dotnet watch run

# Executar testes
dotnet test
```

### Frontend

```bash
# Executar frontend
cd src/Arxis.Web
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Migrations

```bash
# Adicionar nova migration
dotnet ef migrations add <MigrationName> --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Atualizar banco de dados
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Remover última migration
dotnet ef migrations remove --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

## 🎯 Módulos

A plataforma ARXIS está organizada em 16 módulos principais:

### 1. 📊 Dashboard
Visão geral da obra e portfólio, KPIs, alertas e próximos eventos.

### 2. 🏗️ Projects
Gestão de projetos/obras, templates, clonagem e arquivamento.

### 3. 📅 Timeline 4D
Cronograma Gantt, simulação 4D, curva S e produtividade.

### 4. 🏢 Model 3D
Visualizador BIM, clash detection, explorador de dados do modelo.

### 5. ✅ Tasks & Workflow
Board Kanban de tarefas, designer de workflows e aprovações.

### 6. 👷 Field
Diário de obra, checklists de campo, fotos georreferenciadas.

### 7. ⚠️ Issues & RFI
Gestão de pendências, RFIs (Request for Information) e não-conformidades.

### 8. 💰 Costs & Budget
Orçamento, controle de custos, medições e previsões.

### 9. 📦 Procurement & Stock
Requisições, pedidos de compra, entregas e controle de estoque.

### 10. 📄 Documents & Contracts
Biblioteca de documentos, contratos, aditivos e controle de revisões.

### 11. 🛡️ Quality & Safety
Planos de qualidade (ITP), não-conformidades e indicadores de segurança.

### 12. 📈 Analytics & Reports
BI, dashboards customizados, relatórios e exportações.

### 13. 🔗 Integrations
Integrações BIM (IFC, Revit), ERP, nuvens (OneDrive, S3) e APIs.

### 14. 🤖 Automations
Rules engine, triggers automáticos e bots agendados.

### 15. ⚙️ Settings (Project)
Configurações específicas da obra, permissões e calendários.

### 16. 👥 Admin (Tenant)
Gestão de usuários, grupos, planos, billing e auditoria.

## 🌐 API

A API REST está documentada com Swagger/OpenAPI.

### Principais Endpoints

#### Projects
- `GET /api/projects` - Lista todos os projetos
- `GET /api/projects/{id}` - Obtém projeto por ID
- `POST /api/projects` - Cria novo projeto
- `PUT /api/projects/{id}` - Atualiza projeto
- `DELETE /api/projects/{id}` - Remove projeto (soft delete)

#### Tasks
- `GET /api/tasks/project/{projectId}` - Lista tarefas do projeto
- `GET /api/tasks/{id}` - Obtém tarefa por ID
- `POST /api/tasks` - Cria nova tarefa
- `PATCH /api/tasks/{id}/status` - Atualiza status da tarefa
- `PUT /api/tasks/{id}` - Atualiza tarefa
- `DELETE /api/tasks/{id}` - Remove tarefa

#### Issues
- `GET /api/issues/project/{projectId}` - Lista issues do projeto
- `GET /api/issues/{id}` - Obtém issue por ID
- `POST /api/issues` - Cria nova issue/RFI
- `PATCH /api/issues/{id}/status` - Atualiza status da issue
- `PUT /api/issues/{id}` - Atualiza issue
- `DELETE /api/issues/{id}` - Remove issue

### Autenticação

A autenticação será implementada nas próximas versões usando:
- JWT Tokens
- OAuth 2.0 / OpenID Connect
- Azure AD / Entra ID

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Guia de Estilo

- **Backend**: Seguir convenções do C# e .NET
- **Frontend**: Seguir ESLint rules configuradas
- **Commits**: Usar Conventional Commits

## 📄 Licença

Este projeto é proprietário e confidencial.

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: support@arxis.com
- Issues: GitHub Issues
- Documentação: [docs.arxis.com](https://docs.arxis.com)

---

**ARXIS** - Transformando a gestão de obras com tecnologia e inovação 🚀

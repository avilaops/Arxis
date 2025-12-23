# Arquitetura do Sistema ARXIS

## Visão Geral

O ARXIS utiliza uma arquitetura em camadas (layered architecture) combinada com padrões de Domain-Driven Design (DDD) e Clean Architecture.

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  ┌────────────────┐          ┌─────────────────┐   │
│  │   Arxis.Web    │          │   Arxis.API     │   │
│  │   (React/TS)   │◄────────►│  (Controllers)  │   │
│  └────────────────┘          └─────────────────┘   │
└────────────────────┬─────────────────┬──────────────┘
                     │                 │
┌────────────────────▼─────────────────▼──────────────┐
│               Application Layer                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services, DTOs, Validators, Mappers         │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│                  Domain Layer                        │
│  ┌──────────────────────────────────────────────┐  │
│  │  Entities, Value Objects, Enums, Interfaces  │  │
│  │  Business Rules, Domain Services             │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│              Infrastructure Layer                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  DbContext, Repositories, External APIs      │  │
│  │  File Storage, Email, Notifications          │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Detalhamento das Camadas

### 1. Domain Layer (`Arxis.Domain`)

**Responsabilidade**: Contém a lógica de negócio pura e entidades do domínio.

**Componentes**:
- **Entities**: Classes que representam conceitos de negócio
  - `Project`, `User`, `WorkTask`, `Issue`, etc.
- **Value Objects**: Objetos imutáveis sem identidade
- **Enums**: `ProjectStatus`, `TaskPriority`, `IssueType`, etc.
- **Interfaces**: Contratos para repositórios e serviços
- **Domain Services**: Lógica de negócio que não pertence a uma entidade específica

**Regras**:
- ❌ Não deve ter dependências de outras camadas
- ❌ Não deve conhecer banco de dados ou frameworks
- ✅ Deve ser completamente testável sem dependências externas

### 2. Infrastructure Layer (`Arxis.Infrastructure`)

**Responsabilidade**: Implementa os detalhes técnicos e integrações externas.

**Componentes**:
- **DbContext**: `ArxisDbContext` - configuração do Entity Framework
- **Repositories**: Implementação de acesso a dados
- **Migrations**: Versionamento do esquema do banco
- **External Services**:
  - Integração BIM (IFC, Revit)
  - Integração ERP
  - Serviços de armazenamento (S3, Azure Blob)
  - Email/Notificações

**Regras**:
- ✅ Pode referenciar `Arxis.Domain`
- ❌ Não deve ser referenciado pelo Domain
- ✅ Implementa interfaces definidas no Domain

### 3. Application Layer (Future - `Arxis.Application`)

**Responsabilidade**: Orquestra o fluxo de dados e casos de uso.

**Componentes** (a ser implementado):
- **DTOs**: Data Transfer Objects
- **Commands/Queries**: CQRS pattern
- **Validators**: FluentValidation
- **Mappers**: AutoMapper
- **Use Cases**: Lógica de aplicação

### 4. Presentation Layer

#### API (`Arxis.API`)

**Responsabilidade**: Expõe endpoints REST para o frontend.

**Componentes**:
- **Controllers**: Gerenciam requisições HTTP
  - `ProjectsController`
  - `TasksController`
  - `IssuesController`
- **Middleware**: Tratamento de erros, logging, autenticação
- **Filters**: Validação, autorização
- **Configuration**: Startup, DI, appsettings

#### Web (`Arxis.Web`)

**Responsabilidade**: Interface do usuário.

**Componentes**:
- **Components**: Componentes React reutilizáveis
- **Pages**: Telas principais de cada módulo
- **Services**: Comunicação com API
- **State Management**: Context API ou Redux
- **Routing**: React Router

## Fluxo de Dados

### Request Flow (Frontend → Backend)

```
1. User Action (Web)
   ↓
2. HTTP Request (axios)
   ↓
3. Controller (API)
   ↓
4. Service/Use Case (Application)
   ↓
5. Domain Logic (Domain)
   ↓
6. Repository (Infrastructure)
   ↓
7. Database (SQL Server)
```

### Response Flow (Backend → Frontend)

```
7. Database Query Result
   ↓
6. Entity Mapping
   ↓
5. Business Logic Application
   ↓
4. DTO Transformation
   ↓
3. HTTP Response
   ↓
2. Data Processing (React Query)
   ↓
1. UI Update (React)
```

## Padrões Utilizados

### Design Patterns

1. **Repository Pattern**
   - Abstrai o acesso a dados
   - Facilita testes e mudanças de tecnologia

2. **Dependency Injection**
   - Desacopla componentes
   - Facilita testes unitários

3. **CQRS** (Futuro)
   - Separa leitura e escrita
   - Otimiza performance

4. **Unit of Work** (Futuro)
   - Gerencia transações
   - Garante consistência

### Architectural Patterns

1. **Clean Architecture**
   - Independência de frameworks
   - Testabilidade
   - Separação de responsabilidades

2. **Domain-Driven Design (DDD)**
   - Foco no domínio de negócio
   - Ubiquitous Language
   - Bounded Contexts (futuro para módulos)

## Tecnologias e Frameworks

### Backend Stack

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| .NET | 10.0 | Runtime |
| ASP.NET Core | 10.0 | Web Framework |
| Entity Framework Core | 10.0 | ORM |
| SQL Server | 2022 | Database |
| Swashbuckle | Latest | API Documentation |

### Frontend Stack

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| React | 18.3 | UI Library |
| TypeScript | 5.7 | Type Safety |
| Vite | 6.0 | Build Tool |
| React Router | 7.1 | Routing |
| TanStack Query | 5.62 | Data Fetching |
| Axios | 1.7 | HTTP Client |

### DevOps Stack

| Tecnologia | Propósito |
|-----------|-----------|
| Docker | Containerization |
| Docker Compose | Local Orchestration |
| Nginx | Web Server |
| GitHub Actions | CI/CD (futuro) |

## Módulos do Sistema

O sistema é dividido em 16 módulos principais, cada um responsável por uma área específica:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Dashboard  │  │  Projects   │  │ Timeline 4D │  │  Model 3D   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Tasks/Workflow│ │    Field    │  │Issues & RFI │  │Costs/Budget │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Procurement │  │  Documents  │  │Quality/Safe.│  │  Analytics  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Integrations │  │ Automations │  │  Settings   │  │    Admin    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### Bounded Contexts (Futuro)

Para escalar melhor, podemos dividir em bounded contexts:

- **Project Management Context**: Projects, Timeline, Model
- **Operations Context**: Field, Tasks, Workflow
- **Issues Management Context**: Issues, RFI, Quality
- **Finance Context**: Costs, Budget, Procurement
- **Document Management Context**: Documents, Contracts
- **Analytics Context**: Reports, BI, KPIs
- **Platform Context**: Users, Tenants, Integrations

## Segurança

### Camadas de Segurança

1. **Authentication**
   - JWT Tokens
   - OAuth 2.0 / OpenID Connect
   - Azure AD / Entra ID (futuro)

2. **Authorization**
   - Role-based Access Control (RBAC)
   - Claims-based authorization
   - Resource-based authorization

3. **Data Protection**
   - Soft deletes (IsDeleted flag)
   - Audit trails (CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
   - Encryption at rest
   - HTTPS/TLS

4. **API Security**
   - CORS policies
   - Rate limiting (futuro)
   - API versioning (futuro)

## Escalabilidade

### Estratégias Futuras

1. **Horizontal Scaling**
   - Containerização (Docker)
   - Kubernetes orchestration
   - Load balancing

2. **Vertical Scaling**
   - Database indexing
   - Query optimization
   - Caching (Redis)

3. **Microservices** (Long-term)
   - Dividir bounded contexts em serviços
   - Event-driven architecture
   - Message queues (RabbitMQ, Kafka)

## Monitoramento e Observabilidade

### Futuras Implementações

1. **Logging**
   - Structured logging (Serilog)
   - Centralized logs (ELK Stack)

2. **Metrics**
   - Application metrics (Prometheus)
   - Performance monitoring

3. **Tracing**
   - Distributed tracing (Jaeger)
   - APM (Application Performance Monitoring)

4. **Health Checks**
   - Database health
   - External services health
   - Container health

## Próximos Passos

1. ✅ Estrutura básica do projeto
2. ✅ Entidades de domínio principais
3. ✅ DbContext e configuração EF Core
4. ✅ Controllers básicos da API
5. ✅ Frontend React com estrutura de módulos
6. ⏳ Implementar Application Layer com DTOs
7. ⏳ Adicionar autenticação e autorização
8. ⏳ Implementar módulos específicos (Timeline, Model 3D, etc.)
9. ⏳ Adicionar testes unitários e de integração
10. ⏳ Implementar CI/CD pipeline

---

**Última atualização**: 2024

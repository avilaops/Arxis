# Guia de Desenvolvimento - ARXIS

## Comandos Úteis

### Backend (.NET)

```bash
# Restaurar dependências
dotnet restore

# Build do projeto
dotnet build

# Build da API
dotnet build src/Arxis.API/Arxis.API.csproj

# Executar API em modo desenvolvimento
cd src/Arxis.API
dotnet run

# Executar com hot reload
dotnet watch run

# Executar testes
dotnet test

# Limpar build
dotnet clean
```

### Migrations (Entity Framework Core)

```bash
# Adicionar nova migration
dotnet ef migrations add <NomeDaMigration> --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Aplicar migrations ao banco
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Remover última migration (se não aplicada)
dotnet ef migrations remove --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Gerar script SQL
dotnet ef migrations script --project src/Arxis.Infrastructure --startup-project src/Arxis.API --output migrations.sql

# Ver lista de migrations
dotnet ef migrations list --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Reverter para migration específica
dotnet ef database update <NomeDaMigration> --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### Frontend (React/Vite)

```bash
# Navegar para o diretório web
cd src/Arxis.Web

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Lint (verificar código)
npm run lint

# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
```

### Docker

```bash
# Build e iniciar todos os containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de serviço específico
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f database

# Rebuild containers
docker-compose build

# Rebuild e iniciar
docker-compose up -d --build

# Parar e remover volumes (CUIDADO: remove dados do banco)
docker-compose down -v

# Executar comando em container
docker-compose exec api bash
docker-compose exec database bash
```

## Estrutura de Branches

```
main            # Produção
├── develop     # Desenvolvimento
    ├── feature/module-dashboard
    ├── feature/module-projects
    ├── feature/api-authentication
    └── bugfix/issue-123
```

### Convenção de Nomenclatura

- `feature/` - Novas funcionalidades
- `bugfix/` - Correções de bugs
- `hotfix/` - Correções urgentes para produção
- `refactor/` - Refatoração de código
- `docs/` - Documentação
- `test/` - Testes

## Commits Convencionais

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat(projects): add project creation form"
git commit -m "feat(api): implement authentication middleware"

# Bug fixes
git commit -m "fix(tasks): resolve status update issue"
git commit -m "fix(ui): correct alignment on dashboard cards"

# Documentation
git commit -m "docs: update API endpoints documentation"
git commit -m "docs(readme): add installation instructions"

# Refactoring
git commit -m "refactor(domain): simplify entity relationships"

# Tests
git commit -m "test(projects): add unit tests for ProjectsController"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore(ci): configure GitHub Actions"
```

### Formato

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas de manutenção
- `ci`: Integração contínua
- `build`: Build system

## Fluxo de Trabalho Git

### 1. Criar nova feature

```bash
# Atualizar develop
git checkout develop
git pull origin develop

# Criar branch de feature
git checkout -b feature/nome-da-feature

# Fazer mudanças e commits
git add .
git commit -m "feat(module): add new functionality"

# Push para remote
git push origin feature/nome-da-feature

# Criar Pull Request no GitHub
```

### 2. Atualizar branch com develop

```bash
# Na sua branch de feature
git checkout feature/nome-da-feature

# Buscar últimas mudanças
git fetch origin

# Rebase com develop
git rebase origin/develop

# Ou merge (se preferir)
git merge origin/develop

# Push (force se fez rebase)
git push origin feature/nome-da-feature --force-with-lease
```

### 3. Corrigir conflitos

```bash
# Durante rebase/merge, se houver conflitos:
# 1. Resolver conflitos nos arquivos
# 2. Adicionar arquivos resolvidos
git add <arquivo-resolvido>

# 3. Continuar rebase
git rebase --continue

# Ou continuar merge
git commit
```

## Debugging

### Backend (.NET)

#### Visual Studio Code

1. Instalar extensão "C# Dev Kit"
2. Pressionar F5 ou usar Run > Start Debugging
3. Breakpoints: clicar na margem esquerda do editor

#### Visual Studio

1. F5 para iniciar debugging
2. F9 para adicionar breakpoint
3. F10 para step over
4. F11 para step into

#### Logs

```csharp
// No controller
_logger.LogInformation("Creating new project: {ProjectName}", project.Name);
_logger.LogWarning("Project not found: {ProjectId}", id);
_logger.LogError(ex, "Error creating project");
```

### Frontend (React)

#### Browser DevTools

```javascript
// Console logs
console.log('Data:', data);
console.error('Error:', error);
console.table(array);

// Debugger
debugger; // Pausa execução aqui
```

#### React DevTools

1. Instalar extensão React Developer Tools
2. Inspecionar componentes
3. Ver props e state
4. Performance profiling

## Testes

### Backend - Testes Unitários

```bash
# Criar projeto de testes
dotnet new xunit -n Arxis.Tests -o tests/Arxis.Tests
dotnet sln add tests/Arxis.Tests/Arxis.Tests.csproj
dotnet add tests/Arxis.Tests reference src/Arxis.Domain
dotnet add tests/Arxis.Tests reference src/Arxis.API

# Executar testes
dotnet test

# Com cobertura
dotnet test /p:CollectCoverage=true

# Testes específicos
dotnet test --filter "FullyQualifiedName~ProjectsController"
```

Exemplo de teste:

```csharp
public class ProjectsControllerTests
{
    [Fact]
    public async Task GetProject_ReturnsProject_WhenExists()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ArxisDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb")
            .Options;
        
        using var context = new ArxisDbContext(options);
        var controller = new ProjectsController(context, Mock.Of<ILogger<ProjectsController>>());
        
        // Act
        var result = await controller.GetProject(Guid.NewGuid());
        
        // Assert
        Assert.NotNull(result);
    }
}
```

### Frontend - Testes com Jest/Vitest

```bash
cd src/Arxis.Web

# Instalar dependências de teste
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Executar testes
npm test

# Com coverage
npm test -- --coverage
```

## Code Style

### Backend (C#)

- Usar PascalCase para classes, métodos, propriedades
- Usar camelCase para variáveis locais e parâmetros
- Usar `_` prefixo para campos privados
- Sempre usar chaves `{}` mesmo para blocos de uma linha
- Máximo 120 caracteres por linha

```csharp
// ✅ Bom
public class ProjectService
{
    private readonly IProjectRepository _repository;
    
    public async Task<Project> CreateProjectAsync(CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow
        };
        
        return await _repository.AddAsync(project);
    }
}

// ❌ Ruim
public class projectService
{
    public async Task<Project> CreateProject(CreateProjectDto dto)
    {
        return await repository.AddAsync(new Project { Name = dto.Name });
    }
}
```

### Frontend (TypeScript/React)

- Usar PascalCase para componentes
- Usar camelCase para funções e variáveis
- Usar interfaces para tipos complexos
- Preferir functional components com hooks
- Usar arrow functions

```typescript
// ✅ Bom
interface Project {
  id: string;
  name: string;
  createdAt: Date;
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div onClick={handleClick}>
      <h3>{project.name}</h3>
    </div>
  );
};

// ❌ Ruim
function ProjectCard(props) {
  var expanded = false;
  
  return <div><h3>{props.project.name}</h3></div>
}
```

## Performance

### Backend

```csharp
// ✅ Usar IQueryable para paginação
var projects = await _context.Projects
    .Where(p => !p.IsDeleted)
    .OrderBy(p => p.CreatedAt)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

// ❌ Não carregar tudo na memória
var allProjects = await _context.Projects.ToListAsync();
var pagedProjects = allProjects.Skip(x).Take(y).ToList();

// ✅ Usar AsNoTracking para leitura
var project = await _context.Projects
    .AsNoTracking()
    .FirstOrDefaultAsync(p => p.Id == id);

// ✅ Incluir relacionamentos apenas quando necessário
var projects = await _context.Projects
    .Include(p => p.ProjectUsers)
    .ThenInclude(pu => pu.User)
    .ToListAsync();
```

### Frontend

```typescript
// ✅ Memoizar valores computados
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ Usar React.memo para componentes pesados
export default React.memo(ProjectCard);

// ✅ Lazy load de rotas
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## Troubleshooting

### Problema: "Cannot connect to SQL Server"

```bash
# Verificar se SQL Server está rodando
docker ps

# Verificar logs do container
docker-compose logs database

# Reiniciar container
docker-compose restart database

# Verificar connection string
# src/Arxis.API/appsettings.json
```

### Problema: "Port 5000 already in use"

```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou mudar porta em launchSettings.json
```

### Problema: "npm install fails"

```bash
# Limpar cache
npm cache clean --force

# Remover node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Ou usar yarn
yarn install
```

### Problema: "Migration pending"

```bash
# Aplicar migrations
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Ou recriar banco
dotnet ef database drop --project src/Arxis.Infrastructure --startup-project src/Arxis.API
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

## Recursos Úteis

### Documentação

- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev)

### Ferramentas

- [Postman](https://www.postman.com) - API testing
- [DB Browser for SQLite](https://sqlitebrowser.org) - Banco de dados local
- [SQL Server Management Studio](https://aka.ms/ssmsfullsetup) - SQL Server
- [Azure Data Studio](https://aka.ms/azuredatastudio) - SQL multiplataforma

### Extensões VS Code

- C# Dev Kit
- ESLint
- Prettier
- GitLens
- Docker
- Thunder Client (API testing)
- Auto Rename Tag
- Path Intellisense

---

Última atualização: 2024

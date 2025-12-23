# 🚀 Guia de Execução - ARXIS

## 📋 Como Rodar o Projeto da Pasta Raiz

Este guia mostra como executar o projeto ARXIS diretamente da pasta raiz usando os scripts criados.

---

## 🎯 Scripts Disponíveis

### Windows (PowerShell - Recomendado)

```powershell
# Executar tudo (Backend + Frontend)
.\run.ps1

# Apenas Backend
.\run-backend.ps1

# Apenas Frontend
.\run-frontend.ps1
```

### Windows (Batch/CMD)

```cmd
# Apenas Backend
run-backend.bat
```

### Linux/Mac (Bash)

```bash
# Dar permissão de execução (primeira vez)
chmod +x run.sh run-backend.sh run-frontend.sh

# Executar tudo (Backend + Frontend)
./run.sh

# Apenas Backend
./run-backend.sh

# Apenas Frontend
./run-frontend.sh
```

---

## 🎮 Menu de Opções

### Script Principal (`run.ps1` ou `run.sh`)

Ao executar o script principal, você verá:

```
🚀 ARXIS - Sistema de Gerenciamento de Obras
==========================================

Selecione o que deseja executar:
1) Backend apenas (API)
2) Frontend apenas (React)
3) Ambos (Backend + Frontend)      ← RECOMENDADO
4) Build tudo
5) Limpar e reconstruir
6) Migrations (atualizar banco)    ← PowerShell apenas
```

**Opção 3** é a recomendada para desenvolvimento - inicia backend e frontend automaticamente!

---

## 🛠️ Comandos Diretos dotnet (Alternativa)

Se preferir usar `dotnet` diretamente da raiz:

### Backend

```bash
# Run normal
dotnet run --project src/Arxis.API/Arxis.API.csproj

# Watch (hot reload)
dotnet watch run --project src/Arxis.API/Arxis.API.csproj

# Build apenas
dotnet build src/Arxis.API/Arxis.API.csproj

# Clean
dotnet clean
```

### Migrations

```bash
# Aplicar migrations
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Criar nova migration
dotnet ef migrations add NomeDaMigration --project src/Arxis.Infrastructure --startup-project src/Arxis.API

# Remover última migration
dotnet ef migrations remove --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

### Tests (quando implementados)

```bash
# Rodar testes
dotnet test

# Com cobertura
dotnet test /p:CollectCoverage=true
```

---

## 📦 Frontend Standalone

Se quiser rodar apenas o frontend manualmente:

```bash
# Da pasta raiz
cd src/Arxis.Web

# Instalar dependências (primeira vez)
npm install

# Dev server
npm run dev

# Build produção
npm run build

# Preview build
npm run preview
```

---

## 🔧 Configuração Inicial

### Primeira Execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/avilaops/Arxis.git
   cd Arxis
   ```

2. **Configure User Secrets** (Backend)
   ```bash
   dotnet user-secrets init --project src/Arxis.API
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=ArxisDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True;" --project src/Arxis.API
   ```

3. **Configure Variáveis de Ambiente** (Frontend)
   ```bash
   cd src/Arxis.Web
   cp .env.example .env
   # Editar .env com suas configurações
   ```

4. **Execute o script principal**
   ```powershell
   # Windows
   .\run.ps1

   # Linux/Mac
   ./run.sh
   ```

---

## 🎯 URLs Padrão

Após iniciar, acesse:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Backend API** | http://localhost:5000 | API REST |
| **Swagger** | http://localhost:5000/swagger | Documentação API |
| **Frontend** | http://localhost:5173 | Interface React |
| **Health Check** | http://localhost:5000/health | Status da API |

---

## 📝 Exemplos de Uso

### Desenvolvimento Completo (Recomendado)

```powershell
# Windows PowerShell
.\run.ps1
# Escolher opção 3 (Ambos)
```

```bash
# Linux/Mac
./run.sh
# Escolher opção 3 (Ambos)
```

**Resultado:**
- ✅ Backend rodando em http://localhost:5000
- ✅ Frontend rodando em http://localhost:5173
- ✅ Swagger disponível em http://localhost:5000/swagger
- ✅ Hot reload habilitado em ambos

---

### Apenas Backend (API)

```powershell
# PowerShell
.\run-backend.ps1
# Escolher opção 1 (Run normal) ou 2 (Watch)
```

**Testar API:**
```bash
# Via curl
curl http://localhost:5000/health

# Via PowerShell
Invoke-WebRequest http://localhost:5000/health
```

---

### Apenas Frontend

```powershell
# PowerShell
.\run-frontend.ps1
# Escolher opção 1 (Dev)
```

**Configurar API URL:**
Editar `src/Arxis.Web/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Porta já em uso

**Backend (5000):**
```powershell
# Windows - Matar processo na porta 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (5173):**
```powershell
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Script PowerShell bloqueado

```powershell
# Permitir execução de scripts (admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou para sessão atual
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### .NET não encontrado

```bash
# Verificar instalação
dotnet --version

# Se não encontrado, instalar:
# https://dotnet.microsoft.com/download
```

### Node.js não encontrado

```bash
# Verificar instalação
node --version
npm --version

# Se não encontrado, instalar:
# https://nodejs.org/
```

### Migrations não aplicadas

```bash
# Da pasta raiz
dotnet ef database update --project src/Arxis.Infrastructure --startup-project src/Arxis.API
```

---

## 🚦 Status do Projeto

### Verificar se tudo está OK

```bash
# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:5173
```

### Logs

**Backend:**
- Logs aparecem no terminal onde foi executado
- Logs estruturados com nível (Info, Warning, Error)

**Frontend:**
- Logs no console do navegador (F12)
- Hot reload messages no terminal

---

## 📚 Documentação Relacionada

- **QUICKSTART.md** - Guia rápido de 5 minutos
- **GETTING_STARTED.md** - Guia completo de instalação
- **RUNNING.md** - Status dos serviços
- **docs/DEVELOPMENT.md** - Guia de desenvolvimento
- **ACTION_PLAN.md** - Plano de implementação

---

## 🎉 Próximos Passos

Após rodar o projeto:

1. **Testar API** via Swagger: http://localhost:5000/swagger
2. **Criar primeiro usuário** (registro)
3. **Fazer login** e obter token JWT
4. **Testar endpoints protegidos**
5. **Explorar frontend** em http://localhost:5173

---

## 💡 Dicas

### Hot Reload (Desenvolvimento)

**Backend:**
```bash
# Usar watch para hot reload
dotnet watch run --project src/Arxis.API/Arxis.API.csproj
```

**Frontend:**
```bash
# Vite já tem hot reload por padrão
npm run dev
```

### Debug no VS Code

Crie `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ARXIS API",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/src/Arxis.API/bin/Debug/net10.0/Arxis.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/Arxis.API",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

---

**Última atualização:** 2025-12-23  
**Versão:** 1.0

**🎊 Projeto pronto para desenvolvimento!**

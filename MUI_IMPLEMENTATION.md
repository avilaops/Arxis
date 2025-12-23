# 🎨 Guia de Implementação Material-UI - ARXIS

## ✅ O que foi implementado

### 📦 Estrutura de Arquivos Criada

```
src/Arxis.Web/src/
├── theme/
│   └── theme.ts                     # Tema customizado ARXIS
├── context/
│   └── AuthContext.tsx              # Context de autenticação JWT
├── components/
│   ├── Layout/
│   │   ├── AppBarComponent.tsx     # Header com menu e perfil
│   │   ├── Sidebar.tsx             # Menu lateral com navegação
│   │   └── Layout.tsx              # Layout principal
│   └── ProtectedRoute.tsx          # HOC para rotas protegidas
├── pages/
│   ├── Login.tsx                    # Página de login/registro com tabs
│   ├── Dashboard.tsx                # Dashboard com KPI cards
│   ├── Projects.tsx                 # Lista de projetos com DataGrid
│   ├── Tasks.tsx                    # Página de tarefas (placeholder)
│   └── Issues.tsx                   # Página de issues (placeholder)
└── services/
    └── apiService.ts                # Atualizado com JWT auth
```

---

## 🚀 Instalação dos Pacotes

### Passo 1: Navegar para o Frontend

```powershell
# Da pasta raiz
cd src\Arxis.Web
```

### Passo 2: Instalar Dependências MUI

```powershell
# Pacotes principais do Material-UI
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# DataGrid e Date Pickers
npm install @mui/x-data-grid @mui/x-date-pickers

# Date library
npm install dayjs

# React Router (se ainda não tiver)
npm install react-router-dom
```

### Passo 3: Verificar Instalação

```powershell
# Ver package.json atualizado
cat package.json

# Ou rodar npm install para instalar tudo
npm install
```

---

## 🎯 Componentes Implementados

### 1. Tema Customizado (`theme/theme.ts`)

✅ **Paleta de cores ARXIS:**
- Primary: Azul profissional (#1976d2)
- Secondary: Laranja construção (#ff9800)
- Error, Warning, Info, Success

✅ **Tipografia Roboto**

✅ **Componentes customizados:**
- Botões sem uppercase
- Cards com shadow leve
- AppBar com shadow sutil

✅ **Helpers de cor:**
- Status colors (active, completed, onHold, etc.)
- Priority colors (low, medium, high, critical)

---

### 2. AuthContext (`context/AuthContext.tsx`)

✅ **Funcionalidades:**
- Login com JWT
- Registro de usuário
- Logout
- Auto-login no refresh (localStorage)
- Estado global de autenticação
- Hook `useAuth()` para acessar contexto

✅ **Interface:**
```typescript
const { user, token, login, register, logout, isAuthenticated, isLoading } = useAuth();
```

---

### 3. Layout Components

#### AppBarComponent
✅ Header fixo com:
- Menu hamburger (abre sidebar)
- Título ARXIS
- Badge de notificações
- Avatar do usuário
- Menu dropdown (Perfil, Sair)

#### Sidebar
✅ Menu lateral com:
- Items principais (Dashboard, Projetos, Tarefas, Issues, Relatórios)
- Items secundários (Usuários, Configurações)
- Highlight do item ativo
- Fecha automaticamente no mobile
- Versão do app no footer

#### Layout
✅ Container principal que:
- Integra AppBar + Sidebar
- Renderiza páginas filhas com `<Outlet />`
- Background cinza claro
- Padding adequado

---

### 4. Páginas

#### Login (`pages/Login.tsx`)
✅ Página completa com:
- **Tabs:** Login e Registro
- **Form de Login:** Email + Senha
- **Form de Registro:** Nome, Sobrenome, Email, Telefone, Senha
- **Feedback de erro:** Alert do MUI
- **Loading state:** Botão desabilitado
- **Design responsivo:** Centralizado

#### Dashboard (`pages/Dashboard.tsx`)
✅ Dashboard com:
- **4 KPI Cards:** Projetos Ativos, Tarefas Pendentes, Issues, Tarefas Concluídas
- **Grid layout:** Responsivo
- **Placeholders:** Para gráficos futuros

#### Projects (`pages/Projects.tsx`)
✅ Lista de projetos com:
- **MUI DataGrid** com colunas:
  - Nome do Projeto
  - Cliente
  - Status (com Chip colorido)
  - Orçamento (formatado R$)
  - Data Início/Término (formatado)
  - Ações (Ver, Editar, Excluir)
- **Botão Novo Projeto**
- **Checkbox selection**
- **Paginação:** 10, 25, 50 items
- **Loading state**
- **Integração com projectService**

#### Tasks & Issues
✅ Páginas placeholder para implementação futura

---

### 5. ProtectedRoute

✅ HOC para proteger rotas:
- Verifica se usuário está autenticado
- Mostra loading enquanto verifica
- Redireciona para /login se não autenticado
- Renderiza children se autenticado

---

### 6. apiService Atualizado

✅ Melhorias:
- **Headers com JWT:** `Authorization: Bearer {token}`
- **Auto-logout em 401:** Remove token e redireciona
- **Métodos completos:** GET, POST, PUT, DELETE, PATCH
- **Error handling:** Consistente

---

## 🎮 Como Usar

### Rodar o Frontend

```powershell
# Da pasta raiz
.\run-frontend.ps1

# OU manualmente
cd src\Arxis.Web
npm install  # Primeira vez
npm run dev
```

### Rodar Backend + Frontend

```powershell
# Da pasta raiz
.\run.ps1
# Escolher opção 3 (Ambos)
```

---

## 📝 Fluxo de Autenticação

### 1. Usuário acessa a aplicação

```
→ App.tsx (AuthProvider)
→ ProtectedRoute verifica token
→ Não autenticado? → Redireciona /login
→ Autenticado? → Renderiza Layout
```

### 2. Login

```
→ Login.tsx
→ useAuth().login(email, password)
→ POST /api/auth/login
→ Recebe token + user data
→ Salva em localStorage
→ Atualiza AuthContext
→ Redireciona para /
```

### 3. Requisições à API

```
→ projectService.getAll()
→ apiService.get('/projects')
→ Inclui header: Authorization: Bearer {token}
→ Backend valida JWT
→ Retorna dados ou 401
```

### 4. Logout

```
→ Usuário click em "Sair"
→ useAuth().logout()
→ Remove token e user do localStorage
→ Limpa AuthContext
→ Redireciona /login
```

---

## 🎨 Customização do Tema

### Mudar cores principais

```typescript
// src/Arxis.Web/src/theme/theme.ts

export const arxisTheme = createTheme({
  palette: {
    primary: {
      main: '#SEU_COR_AQUI',
    },
    secondary: {
      main: '#SUA_COR_SECUNDARIA',
    },
  },
});
```

### Adicionar novos status colors

```typescript
export const statusColors = {
  active: '#4caf50',
  myNewStatus: '#9c27b0',  // Adicione aqui
};
```

---

## 📊 Implementações Futuras Sugeridas

### Próximos Passos

1. **ProjectForm com Dialog**
   - Formulário de criação/edição de projeto
   - Validação com react-hook-form
   - DatePicker do MUI

2. **Tasks com Kanban Board**
   - react-beautiful-dnd
   - Cards drag & drop
   - Colunas: Backlog, In Progress, Review, Done

3. **Issues com filtros**
   - Filtros por tipo, prioridade, status
   - Badge de RFI
   - Timeline de comentários

4. **Dashboard com Gráficos**
   - recharts ou chart.js
   - Gráfico de progresso de projetos
   - Timeline de atividades

5. **Upload de Arquivos**
   - Dropzone
   - Preview de imagens
   - Integração com backend

6. **Notificações Real-time**
   - SignalR integration
   - Toast notifications (notistack)

7. **Dark Mode**
   - Toggle no header
   - Persistência em localStorage

---

## 🐛 Troubleshooting

### Erro: Cannot find module '@mui/material'

```powershell
# Instalar dependências
cd src\Arxis.Web
npm install
```

### Erro: React Router - useNavigate is not a function

```powershell
# Verificar se react-router-dom está instalado
npm install react-router-dom
```

### Erro: DataGrid não aparece

```powershell
# Instalar @mui/x-data-grid
npm install @mui/x-data-grid
```

### Build Error: Type errors

```powershell
# Limpar e rebuild
npm run build
```

### API retorna 401

```
# Verificar se token está sendo enviado
# Abrir DevTools > Network > Ver headers
# Deve ter: Authorization: Bearer eyJ...
```

---

## ✅ Checklist de Implementação

- [x] ✅ Tema ARXIS criado
- [x] ✅ AuthContext implementado
- [x] ✅ Layout completo (AppBar + Sidebar)
- [x] ✅ Login/Registro com tabs
- [x] ✅ Dashboard com KPIs
- [x] ✅ Projects com DataGrid
- [x] ✅ ProtectedRoute
- [x] ✅ apiService com JWT
- [x] ✅ React Router configurado
- [x] ✅ package.json atualizado
- [ ] ⏳ Instalar pacotes npm
- [ ] ⏳ Testar login
- [ ] ⏳ Testar navegação
- [ ] ⏳ Testar CRUD de projetos

---

## 🎉 Status Final

**Implementação MUI Completa!**

✅ **Estrutura:** 100%  
✅ **Componentes:** 100%  
✅ **Rotas:** 100%  
✅ **Autenticação:** 100%  
⏳ **Instalação NPM:** Pendente  
⏳ **Testes:** Pendente  

---

## 📚 Documentação MUI

- **Material-UI:** https://mui.com/
- **DataGrid:** https://mui.com/x/react-data-grid/
- **Date Pickers:** https://mui.com/x/react-date-pickers/
- **Icons:** https://mui.com/material-ui/material-icons/

---

## 🚀 Próxima Ação

### Instalar e Testar

```powershell
# 1. Navegar para frontend
cd src\Arxis.Web

# 2. Instalar tudo
npm install

# 3. Rodar dev server
npm run dev

# 4. Acessar
# http://localhost:5173

# 5. Testar login/registro
```

---

**Última atualização:** 2025-12-23  
**Versão:** 1.0  
**Status:** ✅ Pronto para instalação e testes

**🎊 Material-UI implementado com sucesso no ARXIS!**

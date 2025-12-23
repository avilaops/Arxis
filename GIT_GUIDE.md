# 🔧 Guia Git - Push para avilaops/arxis

## 📋 Passo a Passo

### 1️⃣ Inicializar Repositório Git

```bash
# Inicializar git no diretório atual
git init

# Verificar status
git status
```

### 2️⃣ Configurar Usuário Git (se necessário)

```bash
# Configurar nome
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu.email@exemplo.com"

# Verificar configuração
git config --list
```

### 3️⃣ Adicionar Arquivos ao Stage

```bash
# Adicionar todos os arquivos (exceto os do .gitignore)
git add .

# Verificar o que será commitado
git status
```

### 4️⃣ Fazer o Primeiro Commit

```bash
# Commit inicial
git commit -m "Initial commit - ARXIS Construction Management Platform

- Backend ASP.NET Core 10.0 with 3 controllers
- Frontend React 18 + TypeScript
- Entity Framework Core with SQL Server
- Docker configuration
- Complete documentation
- 15 ARXIS modules structure"
```

### 5️⃣ Adicionar Repositório Remoto

```bash
# Adicionar remote (HTTPS)
git remote add origin https://github.com/avilaops/arxis.git

# OU via SSH (se tiver chave configurada)
git remote add origin git@github.com:avilaops/arxis.git

# Verificar remote
git remote -v
```

### 6️⃣ Renomear Branch para 'main' (se necessário)

```bash
# Verificar nome da branch atual
git branch

# Se estiver 'master', renomear para 'main'
git branch -M main
```

### 7️⃣ Fazer Push para GitHub

```bash
# Push inicial (cria a branch no remote)
git push -u origin main

# Se der erro de autenticação, use Personal Access Token
# Veja instruções abaixo
```

---

## 🔑 Autenticação no GitHub

### Opção 1: HTTPS com Personal Access Token (Recomendado)

1. **Criar Token:**
   - Acesse: https://github.com/settings/tokens
   - Click em "Generate new token" → "Generate new token (classic)"
   - Selecione scopes:
     - ✅ `repo` (acesso completo a repositórios)
     - ✅ `workflow` (se for usar GitHub Actions)
   - Click em "Generate token"
   - **COPIE O TOKEN** (você só verá uma vez!)

2. **Usar Token no Push:**
   ```bash
   # Quando pedir senha, cole o token (não a senha do GitHub)
   git push -u origin main
   
   # Username: avilaops
   # Password: [cole o token aqui]
   ```

3. **Salvar Credenciais (opcional):**
   ```bash
   # Configurar cache de credenciais (15 minutos)
   git config --global credential.helper cache
   
   # OU salvar permanentemente (Windows)
   git config --global credential.helper wincred
   ```

### Opção 2: SSH (Mais Seguro)

1. **Gerar Chave SSH:**
   ```bash
   # Gerar chave
   ssh-keygen -t ed25519 -C "seu.email@exemplo.com"
   
   # Pressione Enter 3 vezes (usa defaults)
   ```

2. **Copiar Chave Pública:**
   ```bash
   # Windows
   cat ~/.ssh/id_ed25519.pub | clip
   
   # OU manualmente
   cat ~/.ssh/id_ed25519.pub
   # Copie o output
   ```

3. **Adicionar no GitHub:**
   - Acesse: https://github.com/settings/keys
   - Click "New SSH key"
   - Cole a chave
   - Click "Add SSH key"

4. **Testar Conexão:**
   ```bash
   ssh -T git@github.com
   # Deve retornar: "Hi avilaops! You've successfully authenticated..."
   ```

5. **Usar SSH Remote:**
   ```bash
   # Se já adicionou HTTPS, remover
   git remote remove origin
   
   # Adicionar SSH
   git remote add origin git@github.com:avilaops/arxis.git
   
   # Push
   git push -u origin main
   ```

---

## 📦 Comandos em Sequência (Copy-Paste)

### Setup Completo (HTTPS)

```bash
# 1. Inicializar
git init
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# 2. Adicionar arquivos
git add .
git status

# 3. Commit
git commit -m "Initial commit - ARXIS Platform"

# 4. Branch main
git branch -M main

# 5. Adicionar remote
git remote add origin https://github.com/avilaops/arxis.git

# 6. Push (pedirá usuário e token)
git push -u origin main
```

### Setup Completo (SSH)

```bash
# 1. Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# 2. Copiar chave e adicionar no GitHub
cat ~/.ssh/id_ed25519.pub

# 3. Inicializar
git init
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# 4. Adicionar arquivos
git add .
git commit -m "Initial commit - ARXIS Platform"

# 5. Branch e remote
git branch -M main
git remote add origin git@github.com:avilaops/arxis.git

# 6. Push
git push -u origin main
```

---

## 🔧 Troubleshooting

### Erro: "remote origin already exists"

```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/avilaops/arxis.git
```

### Erro: "failed to push some refs"

```bash
# Se o repositório remoto já tem commits
git pull origin main --allow-unrelated-histories

# Resolver conflitos se houver
# Depois fazer push
git push -u origin main
```

### Erro: "Permission denied (publickey)"

```bash
# Verificar se chave SSH está carregada
ssh-add -l

# Se vazia, adicionar
ssh-add ~/.ssh/id_ed25519

# Testar conexão
ssh -T git@github.com
```

### Erro: "Authentication failed"

**Solução:** Use Personal Access Token ao invés da senha do GitHub

```bash
# 1. Criar token em: https://github.com/settings/tokens
# 2. No push, quando pedir senha, cole o TOKEN
git push -u origin main
# Username: avilaops
# Password: [COLE O TOKEN AQUI]
```

---

## 📝 Comandos Git Úteis

### Verificar Status
```bash
git status                    # Ver arquivos modificados
git log --oneline            # Ver histórico de commits
git remote -v                # Ver repositórios remotos
git branch                   # Ver branches
```

### Atualizar do Remote
```bash
git pull origin main         # Baixar últimas mudanças
git fetch origin             # Buscar mudanças sem aplicar
```

### Desfazer Mudanças
```bash
git reset HEAD arquivo.txt   # Tirar arquivo do stage
git checkout -- arquivo.txt  # Descartar mudanças locais
git reset --soft HEAD~1      # Desfazer último commit (mantém mudanças)
git reset --hard HEAD~1      # Desfazer último commit (perde mudanças)
```

### Branches
```bash
git branch nome-branch       # Criar branch
git checkout nome-branch     # Trocar de branch
git checkout -b nome-branch  # Criar e trocar
git merge nome-branch        # Merge branch atual com outra
git branch -d nome-branch    # Deletar branch local
```

---

## 🌳 Estrutura de Branches Recomendada

```
main                 # Produção (protegida)
├── develop          # Desenvolvimento
    ├── feature/auth         # Feature de autenticação
    ├── feature/dashboard    # Feature de dashboard
    ├── feature/timeline     # Feature de timeline
    └── bugfix/decimal-fix   # Correção de bugs
```

### Criar Branch de Feature

```bash
# Criar branch para nova feature
git checkout -b feature/autenticacao

# Fazer mudanças
git add .
git commit -m "feat: implement JWT authentication"

# Push da branch
git push -u origin feature/autenticacao

# No GitHub, criar Pull Request: feature/autenticacao → main
```

---

## 📋 Conventional Commits

Use prefixos nos commits:

```bash
# Features
git commit -m "feat(auth): add JWT authentication"
git commit -m "feat(projects): add project creation form"

# Bug fixes
git commit -m "fix(api): correct decimal precision"
git commit -m "fix(ui): resolve alignment issue"

# Documentation
git commit -m "docs: update README with setup instructions"

# Refactoring
git commit -m "refactor(controllers): simplify error handling"

# Tests
git commit -m "test(projects): add unit tests for ProjectsController"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore(docker): update docker-compose config"
```

**Prefixos:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (sem mudança de código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção
- `perf:` - Performance
- `ci:` - CI/CD

---

## 🎯 Próximos Passos

Após o push inicial:

1. **Criar arquivo README no GitHub**
   - Já temos README.md local
   - Vai aparecer automaticamente no GitHub

2. **Configurar GitHub Issues**
   - Criar issues para tarefas do ACTION_PLAN.md
   - Usar labels: `bug`, `enhancement`, `documentation`

3. **Configurar GitHub Projects**
   - Kanban board para gerenciar tarefas
   - Colunas: Todo, In Progress, Done

4. **Configurar Branch Protection**
   - Proteger branch `main`
   - Exigir pull requests
   - Exigir code review

5. **GitHub Actions (Futuro)**
   - CI/CD pipeline
   - Build e testes automáticos
   - Deploy automático

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/avilaops/arxis
- **GitHub Docs:** https://docs.github.com
- **Git Docs:** https://git-scm.com/doc
- **Personal Access Tokens:** https://github.com/settings/tokens
- **SSH Keys:** https://github.com/settings/keys

---

## ✅ Checklist Final

Após fazer o push, verificar:

- [ ] Repositório aparece em https://github.com/avilaops/arxis
- [ ] README.md está renderizado corretamente
- [ ] Todos os arquivos foram enviados
- [ ] .gitignore está funcionando (não enviou node_modules, bin, obj)
- [ ] Documentação está acessível
- [ ] Estrutura de pastas está correta

---

**Última atualização:** 2025-12-22  
**Versão:** 1.0

**🎉 Boa sorte com o push para o GitHub!**


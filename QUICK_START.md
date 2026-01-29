# ⚡ Quick Start - ARXIS

## 🚀 Rodar o projeto COMPLETO em 1 comando

### Windows
```powershell
.\start.ps1
```

### Linux/Mac
```bash
./start.sh
```

**Ou diretamente com Docker Compose:**

```bash
# Produção
docker-compose up --build -d

# Desenvolvimento (com hot-reload)
docker-compose -f docker-compose.dev.yml up --build
```

## 🌐 Acessar

Após iniciar:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| 🌐 **Frontend** | http://localhost:3000 | Aplicação React (produção) |
| 🔧 **Frontend Dev** | http://localhost:5173 | Aplicação React (desenvolvimento) |
| 🔌 **API** | http://localhost:5000 | API Backend |
| 📚 **Swagger** | http://localhost:5000/swagger | Documentação interativa da API |
| 📊 **Redis** | localhost:6379 | Cache distribuído |
| ❤️ **Health Check** | http://localhost:5000/health | Status do sistema |

## 🛑 Parar tudo

```bash
# Windows
.\start.ps1
# Escolha opção 3

# Ou direto
docker-compose down
docker-compose -f docker-compose.dev.yml down
```

## 🧹 Limpar tudo (remover volumes e imagens)

```bash
docker-compose down -v --rmi all
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

## 🔑 Login padrão

**Usuário Admin:**
- Email: `admin@arxis.com`
- Senha: `Admin@123`

**Usuário Teste:**
- Email: `user@arxis.com`
- Senha: `User@123`

## 📝 Comandos úteis

### Ver logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas API
docker-compose logs -f api

# Apenas Frontend
docker-compose logs -f web
```

### Rebuild apenas um serviço
```bash
docker-compose up --build -d api
docker-compose up --build -d web
```

### Entrar no container
```bash
docker exec -it arxis-api bash
docker exec -it arxis-web sh
```

## ❓ Problemas comuns

### Porta já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Parar o processo ou mudar a porta no docker-compose.yml
```

### Redis não conecta
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Ver logs do Redis
docker-compose logs redis
```

### Build falha
```bash
# Limpar cache do Docker
docker builder prune -a

# Rebuild do zero
docker-compose build --no-cache
```

## 🎯 Próximos passos

1. **Explorar a API**: http://localhost:5000/swagger
2. **Testar o frontend**: http://localhost:3000
3. **Ver métricas**: http://localhost:5000/health
4. **Ler documentação completa**: [README.md](README.md)

---

**Pronto!** 🎉 Agora você tem o ARXIS rodando completo com um único comando!

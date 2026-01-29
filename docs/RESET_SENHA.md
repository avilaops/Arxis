# 🔑 GUIA RÁPIDO - RESET DE SENHA

## 📝 Você esqueceu sua senha? Aqui está a solução!

### ✅ API RODANDO EM: http://localhost:5136

---

## 🚀 OPÇÃO 1: Ver Todos os Usuários

```bash
curl http://localhost:5136/api/auth/users
```

Ou acesse no navegador:
**http://localhost:5136/api/auth/users**

Você verá algo como:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "nicolas@avila.inc",
    "name": "Nícolas Ávila",
    "role": "Admin",
    "createdAt": "2024-11-15T23:59:00Z"
  }
]
```

---

## 🔐 OPÇÃO 2: Resetar Senha (POST)

### Usando PowerShell:

```powershell
$body = @{
    email = "nicolas@avila.inc"
    newPassword = "Nova123456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5136/api/auth/reset-password-dev" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Usando cURL:

```bash
curl -X POST http://localhost:5136/api/auth/reset-password-dev \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nicolas@avila.inc\",\"newPassword\":\"Nova123456!\"}"
```

### Resposta de Sucesso:
```json
{
  "message": "Senha resetada com sucesso!",
  "email": "nicolas@avila.inc"
}
```

---

## 🌐 OPÇÃO 3: Usar Swagger UI

1. Acesse: **http://localhost:5136/swagger**
2. Encontre: `POST /api/auth/reset-password-dev`
3. Clique em "Try it out"
4. Preencha:
   ```json
   {
     "email": "nicolas@avila.inc",
     "newPassword": "SuaNovaSenha123!"
   }
   ```
5. Clique em "Execute"

---

## 📧 Email Padrão

Se você não lembra qual email cadastrou, execute:
```powershell
Invoke-RestMethod http://localhost:5136/api/auth/users
```

---

## ⚠️ IMPORTANTE

- Estes endpoints são **SOMENTE PARA DESENVOLVIMENTO**
- **REMOVA** antes de fazer deploy em produção
- Para produção, implemente fluxo completo de reset por email

---

## 🎯 Próximos Passos Após Resetar

1. Acesse: http://arxis.avila.inc (ou localhost:3000)
2. Faça login com:
   - Email: seu_email@exemplo.com
   - Senha: Nova123456! (ou a que você definiu)
3. Aproveite o sistema! 🚀

---

## 🐛 Problemas?

Se algo não funcionar:
1. Verifique se a API está rodando (http://localhost:5136/health)
2. Confira o email correto com GET /api/auth/users
3. Veja os logs no terminal da API

---

**LEMBRE-SE:** Remover estes endpoints antes do deploy em produção!

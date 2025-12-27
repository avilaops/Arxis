# 🚀 Guia Rápido - Testar Sistema de Email

## ✅ Sistema Configurado

**SMTP Porkbun configurado:**
- Host: smtp.porkbun.com:587
- Email: nicolas@avila.inc
- Nome: Nícolas Ávila
- Contatos: +17997811471 / +531910205562

## 📋 Como Testar

### Opção 1: Via Swagger (Recomendado)

1. **Abrir Swagger:**
   ```
   http://localhost:5136/swagger
   ```

2. **Testar validação de email (sem autenticação):**
   - Endpoint: `GET /api/email/validate`
   - Query: `email=nicolas@avila.inc`
   - Clique em "Execute"

3. **Testar reset de senha (sem autenticação):**
   - Endpoint: `POST /api/email/send-password-reset`
   - Body:
     ```json
     {
       "to": "nicolas@avila.inc",
       "userName": "Nícolas Ávila",
       "resetLink": "https://arxis.com/reset?token=test123"
     }
     ```

### Opção 2: Via cURL

```bash
# Validar email
curl http://localhost:5136/api/email/validate?email=nicolas@avila.inc

# Enviar email de reset (sem auth necessário)
curl -X POST http://localhost:5136/api/email/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "to": "nicolas@avila.inc",
    "userName": "Nícolas Ávila",
    "resetLink": "https://arxis.com/reset?token=abc123"
  }'
```

### Opção 3: Via PowerShell

```powershell
# Validar email
Invoke-RestMethod -Uri "http://localhost:5136/api/email/validate?email=nicolas@avila.inc"

# Enviar email de reset
$body = @{
    to = "nicolas@avila.inc"
    userName = "Nícolas Ávila"
    resetLink = "https://arxis.com/reset?token=test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5136/api/email/send-password-reset" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

## 🔐 Para Testar com Autenticação

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:5136/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nícolas Ávila",
    "email": "nicolas@avila.inc",
    "password": "Senha123!",
    "role": "Admin"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:5136/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nicolas@avila.inc",
    "password": "Senha123!"
  }'
```

Copie o token JWT retornado.

### 3. Enviar Email (com token)
```bash
curl -X POST http://localhost:5136/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "to": ["nicolas@avila.inc"],
    "subject": "Teste ARXIS",
    "body": "Email de teste do sistema ARXIS!",
    "isHtml": false
  }'
```

## 📧 Verificar Resultados

1. Verifique sua caixa de entrada: **nicolas@avila.inc**
2. Verifique a pasta de SPAM/Lixo Eletrônico
3. Os logs da API mostrarão:
   ```
   Email sent successfully to nicolas@avila.inc
   ```

## 🎯 Templates Disponíveis

Você pode enviar emails usando templates:

1. **welcome** - Boas-vindas
2. **password_reset** - Reset de senha ✅
3. **notification** - Notificações gerais
4. **issue_assignment** - Atribuição de issues
5. **task_deadline** - Lembretes de prazo

## 🐛 Troubleshooting

### Email não foi enviado?

1. **Verifique os logs da API** - procure por erros SMTP
2. **Verifique as credenciais** em `appsettings.json`
3. **Teste conectividade SMTP:**
   ```powershell
   Test-NetConnection smtp.porkbun.com -Port 587
   ```
4. **Verifique firewall/antivírus** - pode estar bloqueando porta 587

### 401 Unauthorized?

- A maioria dos endpoints requer autenticação JWT
- Use `/api/email/validate` ou `/api/email/send-password-reset` (sem auth)
- Ou faça login primeiro e use o token Bearer

## 📚 Documentação Completa

Veja [EMAIL_SYSTEM.md](./EMAIL_SYSTEM.md) para documentação detalhada.

## ✅ Checklist de Funcionalidades

- [x] SMTP Porkbun configurado
- [x] Interface IEmailService
- [x] EmailService implementado
- [x] 5 templates de email
- [x] EmailController com API REST
- [x] NotificationService integrado
- [x] Validação de emails
- [x] Sistema de filas (QueuedEmail)
- [x] Frontend React service
- [x] Documentação completa

## 🎉 Próximos Passos

1. **Testar via Swagger** ✅
2. **Enviar email real**
3. **Integrar com Issues/Tasks**
4. **Configurar notificações automáticas**
5. **Implementar sistema de filas**
6. **Adicionar métricas e dashboard**

---

**Sistema inspirado em:** avx-cell (Rust) - https://github.com/avilaops/arxis-core

# 📧 Sistema de Email - Arxis

## 🎯 Visão Geral

Sistema completo de email inspirado na biblioteca **avx-cell** do projeto arxis-core (Rust).
Implementado em C# .NET com suporte a SMTP, templates, filas e notificações.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Email Controller                      │
│  (/api/email/send, /api/email/send-template, etc.)     │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │  EmailService     │
         │  (IEmailService)  │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐   ┌──────────┐   ┌─────────┐
│ SMTP   │   │Templates │   │  Queue  │
│Client  │   │ System   │   │ System  │
└────────┘   └──────────┘   └─────────┘
```

## 🚀 Funcionalidades

### ✅ Core Features (Implementado)

#### 1. **Email Simples**
- Envio de emails via SMTP
- Suporte a múltiplos destinatários (To, Cc, Bcc)
- Headers customizados
- Anexos de arquivos

#### 2. **Sistema de Templates**
Baseado no `EmailTemplate` do avx-cell:

- **welcome** - Email de boas-vindas
- **password_reset** - Redefinição de senha
- **notification** - Notificações gerais
- **issue_assignment** - Atribuição de issues
- **task_deadline** - Lembretes de prazo

Substituição de variáveis com sintaxe `{{variable}}`:

```csharp
var variables = new Dictionary<string, string>
{
    { "name", "João" },
    { "app_name", "Arxis" }
};

await emailService.SendTemplatedEmailAsync("welcome", "joao@email.com", variables);
```

#### 3. **Email HTML**
- Suporte completo a emails HTML
- Templates responsivos
- Inline CSS
- Fallback para texto plano

#### 4. **Sistema de Filas**
Baseado no `EmailQueue` do avx-cell:

```csharp
public class QueuedEmail
{
    public EmailQueueStatus Status { get; set; }  // Pending, Sending, Sent, Failed, Retry
    public int Attempts { get; set; }
    public int MaxAttempts { get; set; } = 3;
    public string? LastError { get; set; }
}
```

#### 5. **Validação de Email**
Implementação inspirada no avx-cell:

```csharp
public bool IsValidEmail(string email)
{
    var parts = email.Split('@');
    return parts.Length == 2 &&
           !string.IsNullOrEmpty(parts[0]) &&
           !string.IsNullOrEmpty(parts[1]) &&
           parts[1].Contains('.');
}
```

#### 6. **Sistema de Notificações**
Integração com eventos (inspirado no avx-events):

- Atribuição de issues
- Prazos de tarefas
- Atualizações de projetos
- Menções de usuários
- Alertas do sistema

## 📝 Uso

### 1. Configuração (appsettings.json)

```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "FromAddress": "noreply@arxis.com",
    "FromName": "ARXIS - Gestão de Obras",
    "SmtpUser": "seu-email@gmail.com",
    "SmtpPassword": "sua-senha-de-app"
  },
  "App": {
    "BaseUrl": "http://localhost:3000",
    "Name": "Arxis"
  }
}
```

### 2. Gmail - App Passwords

Para usar Gmail:
1. Ative a verificação em duas etapas
2. Gere uma senha de app: https://myaccount.google.com/apppasswords
3. Use a senha de 16 caracteres no `SmtpPassword`

### 3. Envio Simples

**Endpoint:** `POST /api/email/send`

```json
{
  "from": "sender@arxis.com",
  "to": ["recipient@example.com"],
  "subject": "Teste",
  "body": "Corpo do email",
  "isHtml": false
}
```

### 4. Envio com Template

**Endpoint:** `POST /api/email/send-template`

```json
{
  "templateName": "welcome",
  "to": "user@example.com",
  "variables": {
    "name": "João Silva",
    "app_name": "Arxis",
    "support_email": "support@arxis.com"
  }
}
```

### 5. Email de Boas-vindas

**Endpoint:** `POST /api/email/send-welcome`

```json
{
  "to": "user@example.com",
  "userName": "João Silva"
}
```

### 6. Reset de Senha

**Endpoint:** `POST /api/email/send-password-reset`

```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "resetLink": "https://arxis.com/reset-password?token=abc123"
}
```

### 7. Notificação de Issue

**Endpoint:** `POST /api/email/send-issue-assignment`

```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "issueTitle": "Bug na página de login",
  "projectName": "Website Corporativo"
}
```

### 8. Lembrete de Prazo

**Endpoint:** `POST /api/email/send-task-deadline`

```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "taskTitle": "Revisar documentação",
  "deadline": "2025-12-31T23:59:59Z"
}
```

### 9. Envio em Lote

**Endpoint:** `POST /api/email/send-batch`

```json
[
  {
    "to": ["user1@example.com"],
    "subject": "Newsletter",
    "body": "Conteúdo..."
  },
  {
    "to": ["user2@example.com"],
    "subject": "Newsletter",
    "body": "Conteúdo..."
  }
]
```

### 10. Validar Email

**Endpoint:** `GET /api/email/validate?email=user@example.com`

Resposta:
```json
{
  "email": "user@example.com",
  "isValid": true
}
```

## 🔧 Uso Programático

### No Código C#

```csharp
public class MyController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;

    public MyController(
        IEmailService emailService,
        INotificationService notificationService)
    {
        _emailService = emailService;
        _notificationService = notificationService;
    }

    public async Task<IActionResult> CreateIssue(IssueDto dto)
    {
        // ... criar issue ...

        // Notificar usuário atribuído
        await _notificationService.NotifyIssueAssignedAsync(
            assignedUser.Id,
            assignedUser.Email,
            issue.Title,
            project.Name
        );

        return Ok(issue);
    }
}
```

## 📊 Roadmap

### v1.0 (Atual) ✅
- [x] SMTP Client básico
- [x] Sistema de templates
- [x] Validação de emails
- [x] Envio em lote
- [x] Integração com notificações

### v1.1 (Próximo)
- [ ] Sistema de filas com retry automático
- [ ] Pool de conexões SMTP
- [ ] Rate limiting
- [ ] Métricas e estatísticas
- [ ] Dashboard de emails

### v2.0 (Futuro)
- [ ] Suporte a múltiplos provedores (SendGrid, AWS SES, etc.)
- [ ] Editor visual de templates
- [ ] A/B testing de emails
- [ ] Email tracking (aberturas, cliques)
- [ ] Integração com calendário (iCalendar)

### v3.0 (Avançado)
- [ ] Email encryption (S/MIME)
- [ ] DKIM signing
- [ ] SPF validation
- [ ] Integração com CRM
- [ ] AI-powered email generation

## 🔗 Referências

### avx-cell (Rust)
Biblioteca de referência: https://github.com/avilaops/arxis-core/tree/main/avx-cell

Principais conceitos adaptados:
- `Email` → `EmailMessage`
- `EmailAddress` → Validação integrada
- `EmailTemplate` → Sistema de templates
- `QueuedEmail` → Sistema de filas
- `SmtpClient` → SmtpClient .NET

### avx-events (Rust)
Sistema pub/sub que inspirou o `NotificationService`:
- Event-driven notifications
- Multiple subscribers
- Async message passing

### Diferenças .NET vs Rust

| avx-cell (Rust) | Arxis (.NET) |
|-----------------|--------------|
| `SmtpClient::connect()` | `SmtpClient` (System.Net.Mail) |
| `EmailQueue::process()` | `SendBatchEmailsAsync()` |
| `Template::render()` | `SubstituteVariables()` |
| Zero-cost abstractions | LINQ + async/await |
| `Result<T, Error>` | `Task<bool>` |

## 🧪 Testes

### Teste Manual (Swagger)

1. Acesse: http://localhost:5136/swagger
2. Navegue para `/api/email/send`
3. Execute com payload de teste

### Teste com cURL

```bash
curl -X POST http://localhost:5136/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["test@example.com"],
    "subject": "Test",
    "body": "Hello from Arxis!"
  }'
```

## 📚 Documentação Adicional

- [avx-cell README](https://github.com/avilaops/arxis-core/blob/main/avx-cell/README.md)
- [SMTP Protocol RFC 5321](https://tools.ietf.org/html/rfc5321)
- [Email Format RFC 5322](https://tools.ietf.org/html/rfc5322)
- [MIME RFC 2045](https://tools.ietf.org/html/rfc2045)

## 🤝 Contribuindo

Este sistema foi inspirado pelo ecossistema avx (arxis-core), que demonstra conceitos avançados de:
- Zero-dependency email protocols
- Template systems with variable substitution
- Queue-based email delivery
- Event-driven notifications

Contribuições são bem-vindas seguindo estes padrões!

## 📄 Licença

MIT License - Parte do projeto Arxis

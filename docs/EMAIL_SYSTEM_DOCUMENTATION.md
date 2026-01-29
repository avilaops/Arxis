# Sistema de Email - Documentação Completa

## 📧 Visão Geral

Sistema completo de envio de emails com templates profissionais para o projeto Arxis. Implementado usando SMTP do Porkbun e inspirado na arquitetura do avx-cell.

---

## 🔧 Configuração

### SMTP Settings
```json
{
  "Email": {
    "SmtpHost": "smtp.porkbun.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "FromAddress": "nicolas@avila.inc",
    "FromName": "Arxis Team",
    "SmtpUser": "nicolas@avila.inc",
    "SmtpPassword": "7Aciqgr7@3278579"
  }
}
```

### Services Registration
```csharp
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
```

---

## 📋 Templates Disponíveis

### 1. 🎉 Welcome Email
**Template:** `welcome`
**Uso:** Boas-vindas para novos usuários
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-welcome`
```json
{
  "to": "user@example.com",
  "userName": "João Silva"
}
```

---

### 2. 📧 Email Confirmation
**Template:** `email_confirmation`
**Uso:** Confirmação de email após registro
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{confirmationLink}}`: Link de confirmação
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-email-confirmation`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "confirmationLink": "https://arxis.com/confirm/abc123"
}
```

---

### 3. 🔐 Login Notification
**Template:** `login_notification`
**Uso:** Alerta de segurança após login
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{loginTime}}`: Horário do login
- `{{device}}`: Dispositivo usado
- `{{location}}`: Localização
- `{{resetLink}}`: Link para reset se não foi você
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-login-notification`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "loginTime": "27/12/2024 às 10:30",
  "device": "Chrome no Windows",
  "location": "São Paulo, SP - Brasil",
  "resetLink": "https://arxis.com/reset"
}
```

---

### 4. 🔑 Password Reset
**Template:** `password_reset`
**Uso:** Solicitação de redefinição de senha
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{resetLink}}`: Link para reset
- `{{expiryTime}}`: Tempo de expiração (ex: "15 minutos")
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-password-reset`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "resetLink": "https://arxis.com/reset/token123",
  "expiryTime": "15 minutos"
}
```

---

### 5. ✅ Password Changed
**Template:** `password_changed`
**Uso:** Confirmação de alteração de senha
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{changeTime}}`: Horário da mudança
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-password-changed`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "changeTime": "27/12/2024 às 14:45"
}
```

---

### 6. 😴 Inactive User
**Template:** `inactive_user`
**Uso:** Re-engajamento de usuários inativos
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{daysInactive}}`: Dias sem login
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-inactive-user`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "daysInactive": 30
}
```

---

### 7. 📊 Weekly Summary
**Template:** `weekly_summary`
**Uso:** Resumo semanal de atividades
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{tasksCompleted}}`: Tarefas completadas
- `{{activeProjects}}`: Projetos ativos
- `{{timeSaved}}`: Tempo economizado (em horas)
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-weekly-summary`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "tasksCompleted": 15,
  "activeProjects": 3,
  "timeSaved": 8
}
```

---

### 8. 🎁 Promotion
**Template:** `promotion`
**Uso:** Emails promocionais e ofertas especiais
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{promoTitle}}`: Título da promoção
- `{{promoDescription}}`: Descrição da oferta
- `{{promoCode}}`: Código promocional
- `{{expiryDate}}`: Data de expiração
- `{{promoLink}}`: Link da promoção
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-promotion`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "promoTitle": "50% OFF Premium",
  "promoDescription": "Aproveite nossa oferta especial de fim de ano!",
  "promoCode": "NEWYEAR50",
  "expiryDate": "31/12/2024",
  "promoLink": "https://arxis.com/promo/newyear"
}
```

---

### 9. 📰 Newsletter
**Template:** `newsletter`
**Uso:** Newsletters e atualizações
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{newsletterTitle}}`: Título da newsletter
- `{{newsletterContent}}`: Conteúdo principal
- `{{newsletterLink}}`: Link para ler mais
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-newsletter`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "newsletterTitle": "Novidades de Dezembro 2024",
  "newsletterContent": "Confira as últimas atualizações do Arxis...",
  "newsletterLink": "https://arxis.com/blog/december-updates"
}
```

---

### 10. 💎 Upgrade Offer
**Template:** `upgrade_offer`
**Uso:** Ofertas de upgrade para planos premium
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{features}}`: Lista de features premium (HTML)
- `{{discountText}}`: Texto do desconto (ex: "20% off")
- `{{upgradeLink}}`: Link para upgrade
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-upgrade-offer`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "features": "<li>Armazenamento ilimitado</li><li>Prioridade no suporte</li>",
  "discountText": "20% de desconto",
  "upgradeLink": "https://arxis.com/upgrade"
}
```

---

### 11. 👥 Team Invite
**Template:** `team_invite`
**Uso:** Convites para equipe/workspace
**Variáveis:**
- `{{inviterName}}`: Nome de quem convida
- `{{teamName}}`: Nome da equipe/projeto
- `{{inviteLink}}`: Link do convite
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-team-invite`
```json
{
  "to": "newmember@example.com",
  "inviterName": "Maria Santos",
  "teamName": "Projeto Alpha",
  "inviteLink": "https://arxis.com/invite/token456"
}
```

---

### 12. 🎂 Birthday
**Template:** `birthday`
**Uso:** Email de aniversário com presente
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{giftDescription}}`: Descrição do presente
- `{{giftCode}}`: Código do presente
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-birthday`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "giftDescription": "1 mês grátis de Premium",
  "giftCode": "BDAY2024"
}
```

---

### 13. 📝 Feedback Request
**Template:** `feedback_request`
**Uso:** Solicitação de feedback/pesquisa
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{feedbackLink}}`: Link da pesquisa
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-feedback-request`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "feedbackLink": "https://arxis.com/survey/q123"
}
```

---

### 14. 🔔 Notification (Generic)
**Template:** `notification`
**Uso:** Notificações genéricas do sistema
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{title}}`: Título da notificação
- `{{message}}`: Mensagem principal
- `{{actionText}}`: Texto do botão (opcional)
- `{{actionLink}}`: Link do botão (opcional)
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-notification`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "title": "Nova Mensagem",
  "message": "Você recebeu uma nova mensagem no projeto X",
  "actionText": "Ver Mensagem",
  "actionLink": "https://arxis.com/messages/123"
}
```

---

### 15. 📋 Issue Assignment
**Template:** `issue_assignment`
**Uso:** Notificação de atribuição de issue
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{issueTitle}}`: Título da issue
- `{{projectName}}`: Nome do projeto
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-issue-assignment`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "issueTitle": "Bug no login",
  "projectName": "Projeto Alpha"
}
```

---

### 16. ⏰ Task Deadline
**Template:** `task_deadline`
**Uso:** Lembrete de prazo de tarefa
**Variáveis:**
- `{{userName}}`: Nome do usuário
- `{{taskTitle}}`: Título da tarefa
- `{{deadline}}`: Data/hora do prazo
- `{{year}}`: Ano atual

**Endpoint:** `POST /api/email/send-task-deadline`
```json
{
  "to": "user@example.com",
  "userName": "João Silva",
  "taskTitle": "Revisar código",
  "deadline": "2024-12-31T23:59:59"
}
```

---

## 🎨 Características dos Templates

Todos os templates incluem:

✅ **Design Responsivo** - Funcionam perfeitamente em desktop e mobile
✅ **HTML Profissional** - Código limpo e bem estruturado
✅ **Branding Consistente** - Cores e identidade visual do Arxis
✅ **Call-to-Actions** - Botões destacados para ações importantes
✅ **Footer Informativo** - Informações de contato e links úteis
✅ **Substituição de Variáveis** - Sistema flexível de personalização

---

## 📡 Endpoints Adicionais

### Enviar Email Customizado
```
POST /api/email/send
{
  "to": "user@example.com",
  "cc": ["copy@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Assunto do email",
  "body": "Texto simples",
  "htmlBody": "<html>...</html>",
  "attachments": []
}
```

### Enviar com Template
```
POST /api/email/send-template
{
  "templateName": "welcome",
  "to": "user@example.com",
  "variables": {
    "userName": "João Silva"
  }
}
```

### Enviar em Lote
```
POST /api/email/send-batch
{
  "emails": [
    { "to": "user1@example.com", ... },
    { "to": "user2@example.com", ... }
  ]
}
```

### Validar Email
```
GET /api/email/validate?email=test@example.com
```

---

## 🧪 Testando o Sistema

### Via Swagger
1. Acesse `http://localhost:5136/swagger`
2. Encontre a seção `Email`
3. Expanda o endpoint desejado
4. Clique em "Try it out"
5. Preencha os dados
6. Clique em "Execute"

### Via PowerShell
```powershell
$body = @{
    to = "nicolas@avila.inc"
    userName = "Nícolas Ávila"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5136/api/email/send-welcome" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Via Frontend (React)
```typescript
import { useEmailService } from './services/emailService';

const { sendWelcomeEmail } = useEmailService();

await sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'João Silva'
});
```

---

## 🔍 Logs e Troubleshooting

### Verificar Logs
Os logs do sistema de email aparecem no console da API:
```
[14:30:45] Email sent successfully to nicolas@avila.inc
```

### Erros Comuns

#### 1. "Failed to send email"
- Verificar credenciais SMTP em appsettings.json
- Confirmar que a porta 587 está acessível
- Validar que EnableSsl está true

#### 2. "Invalid email format"
- Usar o endpoint `/validate` para verificar formato
- Garantir que o email tem formato válido

#### 3. "Template not found"
- Verificar nome do template no EmailService.InitializeTemplates()
- Nomes válidos: welcome, password_reset, notification, etc.

---

## 🎯 Casos de Uso Recomendados

### Fluxo de Registro
1. **Registro** → `welcome` email
2. **Confirmação** → `email_confirmation` email
3. **Primeiro Login** → `login_notification` email

### Fluxo de Segurança
1. **Login Suspeito** → `login_notification` email
2. **Esqueceu Senha** → `password_reset` email
3. **Senha Alterada** → `password_changed` email

### Fluxo de Engajamento
1. **30 dias inativo** → `inactive_user` email
2. **Toda segunda-feira** → `weekly_summary` email
3. **Aniversário** → `birthday` email
4. **Promoção** → `promotion` email

### Fluxo de Trabalho
1. **Issue Atribuída** → `issue_assignment` email
2. **Prazo Próximo** → `task_deadline` email
3. **Convite Time** → `team_invite` email

---

## 📊 Estatísticas e Métricas

O sistema registra:
- ✅ Emails enviados com sucesso
- ❌ Falhas no envio
- ⏱️ Tempo de envio
- 📧 Templates mais usados

---

## 🔐 Segurança

- Credenciais SMTP armazenadas em appsettings.json (não comitar!)
- Validação de formato de email antes do envio
- Proteção contra injection em templates
- Rate limiting recomendado para produção

---

## 🚀 Próximos Passos

1. ✅ Sistema implementado e testado
2. ⏳ Adicionar fila de emails assíncronos (background jobs)
3. ⏳ Implementar retry logic para falhas
4. ⏳ Dashboard de estatísticas de email
5. ⏳ A/B testing de templates
6. ⏳ Personalização avançada (idiomas, temas)

---

## 📞 Suporte

**Empresa:** Ávila Inc.
**Email:** nicolas@avila.inc
**Telefone:** +1 799-781-1471 / +55 31 9102-05562
**Desenvolvedor:** Nícolas Ávila

---

_Documentação criada em 27/12/2024_

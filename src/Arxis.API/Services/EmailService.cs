using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;
using Arxis.API.Models;

namespace Arxis.API.Services;

/// <summary>
/// Email service implementation using SMTP
/// Inspired by avx-cell SMTP client
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPassword;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly bool _enableSsl;
    private readonly Dictionary<string, EmailTemplate> _templates;

    public EmailService(IConfiguration configuration, ILogger<EmailService> _logger)
    {
        _configuration = configuration;
        this._logger = _logger;

        // Load SMTP configuration
        _smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        _smtpUser = _configuration["Email:SmtpUser"] ?? "";
        _smtpPassword = _configuration["Email:SmtpPassword"] ?? "";
        _fromAddress = _configuration["Email:FromAddress"] ?? "noreply@arxis.com";
        _fromName = _configuration["Email:FromName"] ?? "Arxis System";
        _enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

        // Initialize templates
        _templates = InitializeTemplates();
    }

    public async Task<bool> SendEmailAsync(EmailMessage message)
    {
        try
        {
            using var smtpClient = CreateSmtpClient();
            using var mailMessage = CreateMailMessage(message);

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {To}", string.Join(", ", message.To));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", string.Join(", ", message.To));
            return false;
        }
    }

    public async Task<bool> SendTemplatedEmailAsync(string templateName, string to, Dictionary<string, string> variables)
    {
        if (!_templates.ContainsKey(templateName))
        {
            _logger.LogWarning("Template {TemplateName} not found", templateName);
            return false;
        }

        var template = _templates[templateName];

        // Verify required variables
        foreach (var required in template.RequiredVariables)
        {
            if (!variables.ContainsKey(required))
            {
                _logger.LogWarning("Missing required variable {Variable} for template {Template}",
                    required, templateName);
                return false;
            }
        }

        // Substitute variables
        var subject = SubstituteVariables(template.Subject, variables);
        var body = SubstituteVariables(template.Body, variables);
        var htmlBody = template.HtmlBody != null ? SubstituteVariables(template.HtmlBody, variables) : null;

        var message = new EmailMessage
        {
            To = new List<string> { to },
            Subject = subject,
            Body = body,
            HtmlBody = htmlBody,
            IsHtml = htmlBody != null
        };

        return await SendEmailAsync(message);
    }

    public async Task<bool> SendWelcomeEmailAsync(string to, string userName)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "app_name", "Arxis" },
            { "support_email", _fromAddress }
        };

        return await SendTemplatedEmailAsync("welcome", to, variables);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string userName, string resetLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "reset_link", resetLink },
            { "expiry", "24" }
        };

        return await SendTemplatedEmailAsync("password_reset", to, variables);
    }

    public async Task<bool> SendNotificationEmailAsync(string to, string title, string message, string? details = null)
    {
        var variables = new Dictionary<string, string>
        {
            { "title", title },
            { "message", message },
            { "details", details ?? "" }
        };

        return await SendTemplatedEmailAsync("notification", to, variables);
    }

    public async Task<bool> SendIssueAssignmentEmailAsync(string to, string userName, string issueTitle, string projectName)
    {
        var variables = new Dictionary<string, string>
        {
            { "user_name", userName },
            { "issue_title", issueTitle },
            { "project_name", projectName },
            { "app_url", _configuration["App:BaseUrl"] ?? "https://arxis.com" }
        };

        return await SendTemplatedEmailAsync("issue_assignment", to, variables);
    }

    public async Task<bool> SendTaskDeadlineEmailAsync(string to, string userName, string taskTitle, DateTime deadline)
    {
        var variables = new Dictionary<string, string>
        {
            { "user_name", userName },
            { "task_title", taskTitle },
            { "deadline", deadline.ToString("dd/MM/yyyy HH:mm") },
            { "days_left", (deadline - DateTime.UtcNow).Days.ToString() }
        };

        return await SendTemplatedEmailAsync("task_deadline", to, variables);
    }

    public async Task<bool> SendEmailConfirmationAsync(string to, string userName, string confirmationLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "confirmation_link", confirmationLink }
        };

        return await SendTemplatedEmailAsync("email_confirmation", to, variables);
    }

    public async Task<bool> SendLoginNotificationAsync(string to, string userName, string loginTime, string device, string location, string resetLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "login_time", loginTime },
            { "device", device },
            { "location", location },
            { "reset_link", resetLink }
        };

        return await SendTemplatedEmailAsync("login_notification", to, variables);
    }

    public async Task<bool> SendPasswordChangedAsync(string to, string userName, string changeTime)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "change_time", changeTime },
            { "support_email", _fromAddress }
        };

        return await SendTemplatedEmailAsync("password_changed", to, variables);
    }

    public async Task<bool> SendInactiveUserEmailAsync(string to, string userName, int daysInactive)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "days_inactive", daysInactive.ToString() },
            { "app_url", _configuration["App:BaseUrl"] ?? "https://arxis.com" }
        };

        return await SendTemplatedEmailAsync("inactive_user", to, variables);
    }

    public async Task<bool> SendWeeklySummaryEmailAsync(string to, string userName, int tasksCompleted, int activeProjects, int timeSaved)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "tasks_completed", tasksCompleted.ToString() },
            { "active_projects", activeProjects.ToString() },
            { "time_saved", timeSaved.ToString() }
        };

        return await SendTemplatedEmailAsync("weekly_summary", to, variables);
    }

    public async Task<bool> SendPromotionEmailAsync(string to, string userName, string promoTitle, string promoDescription, string promoCode, string expiryDate, string promoLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "promo_title", promoTitle },
            { "promo_description", promoDescription },
            { "promo_code", promoCode },
            { "expiry_date", expiryDate },
            { "promo_link", promoLink }
        };

        return await SendTemplatedEmailAsync("promotion", to, variables);
    }

    public async Task<bool> SendNewsletterAsync(string to, string userName, string newsletterTitle, string newsletterContent, string newsletterLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "newsletter_title", newsletterTitle },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "newsletter_content", newsletterContent },
            { "newsletter_link", newsletterLink }
        };

        return await SendTemplatedEmailAsync("newsletter", to, variables);
    }

    public async Task<bool> SendUpgradeOfferAsync(string to, string userName, string features, string discountText, string upgradeLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "features", features },
            { "discount_text", discountText },
            { "upgrade_link", upgradeLink }
        };

        return await SendTemplatedEmailAsync("upgrade_offer", to, variables);
    }

    public async Task<bool> SendTeamInviteAsync(string to, string inviterName, string teamName, string inviteLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "inviter_name", inviterName },
            { "team_name", teamName },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "invite_link", inviteLink }
        };

        return await SendTemplatedEmailAsync("team_invite", to, variables);
    }

    public async Task<bool> SendBirthdayEmailAsync(string to, string userName, string giftDescription, string giftCode)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "gift_description", giftDescription },
            { "gift_code", giftCode }
        };

        return await SendTemplatedEmailAsync("birthday", to, variables);
    }

    public async Task<bool> SendFeedbackRequestAsync(string to, string userName, string feedbackLink)
    {
        var variables = new Dictionary<string, string>
        {
            { "name", userName },
            { "app_name", _configuration["App:Name"] ?? "Arxis" },
            { "feedback_link", feedbackLink }
        };

        return await SendTemplatedEmailAsync("feedback_request", to, variables);
    }

    public async Task<(int sent, int failed)> SendBatchEmailsAsync(IEnumerable<EmailMessage> messages)
    {
        int sent = 0;
        int failed = 0;

        foreach (var message in messages)
        {
            if (await SendEmailAsync(message))
                sent++;
            else
                failed++;
        }

        _logger.LogInformation("Batch email completed: {Sent} sent, {Failed} failed", sent, failed);
        return (sent, failed);
    }

    public bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            // Based on avx-cell email validation
            var parts = email.Split('@');
            if (parts.Length != 2)
                return false;

            var local = parts[0];
            var domain = parts[1];

            return !string.IsNullOrEmpty(local) &&
                   !string.IsNullOrEmpty(domain) &&
                   domain.Contains('.');
        }
        catch
        {
            return false;
        }
    }

    #region Private Methods

    private SmtpClient CreateSmtpClient()
    {
        var client = new SmtpClient(_smtpHost, _smtpPort)
        {
            EnableSsl = _enableSsl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(_smtpUser, _smtpPassword),
            Timeout = 30000 // 30 seconds
        };

        return client;
    }

    private MailMessage CreateMailMessage(EmailMessage message)
    {
        var mailMessage = new MailMessage
        {
            From = new MailAddress(message.From != string.Empty ? message.From : _fromAddress, _fromName),
            Subject = message.Subject,
            Body = message.IsHtml && message.HtmlBody != null ? message.HtmlBody : message.Body,
            IsBodyHtml = message.IsHtml
        };

        // Add recipients
        foreach (var to in message.To)
        {
            if (IsValidEmail(to))
                mailMessage.To.Add(to);
        }

        foreach (var cc in message.Cc)
        {
            if (IsValidEmail(cc))
                mailMessage.CC.Add(cc);
        }

        foreach (var bcc in message.Bcc)
        {
            if (IsValidEmail(bcc))
                mailMessage.Bcc.Add(bcc);
        }

        // Add custom headers
        foreach (var header in message.Headers)
        {
            mailMessage.Headers.Add(header.Key, header.Value);
        }

        // Add attachments
        foreach (var attachment in message.Attachments)
        {
            var stream = new MemoryStream(attachment.Content);
            var mailAttachment = new Attachment(stream, attachment.FileName, attachment.ContentType);
            mailMessage.Attachments.Add(mailAttachment);
        }

        return mailMessage;
    }

    private string SubstituteVariables(string text, Dictionary<string, string> variables)
    {
        // Based on avx-cell template substitution
        var result = text;
        foreach (var (key, value) in variables)
        {
            result = result.Replace($"{{{{{key}}}}}", value);
        }
        return result;
    }

    private Dictionary<string, EmailTemplate> InitializeTemplates()
    {
        // Based on avx-cell TemplateBuilder - Complete Marketing & Engagement Suite
        return new Dictionary<string, EmailTemplate>
        {
            #region Authentication & Security

            ["welcome"] = new EmailTemplate
            {
                Name = "welcome",
                Subject = "🎉 Bem-vindo ao {{app_name}}!",
                Body = "Olá {{name}},\n\nBem-vindo ao {{app_name}}!\n\nEstamos felizes em tê-lo conosco. " +
                       "Se você tiver alguma dúvida, entre em contato com {{support_email}}.\n\n" +
                       "Atenciosamente,\nEquipe {{app_name}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;'>
                            <h1 style='margin: 0; font-size: 32px;'>🎉 Bem-vindo!</h1>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 18px; color: #333;'>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666; line-height: 1.6;'>
                                Estamos muito felizes em ter você no <strong>{{app_name}}</strong>!
                                Sua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades.
                            </p>
                            <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <h3 style='color: #667eea; margin-top: 0;'>Primeiros Passos:</h3>
                                <ul style='color: #666; line-height: 1.8;'>
                                    <li>Complete seu perfil</li>
                                    <li>Explore o dashboard</li>
                                    <li>Crie seu primeiro projeto</li>
                                    <li>Convide sua equipe</li>
                                </ul>
                            </div>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{app_url}}' style='background: #667eea; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Começar Agora
                                </a>
                            </p>
                            <p style='color: #999; font-size: 14px;'>
                                Precisa de ajuda? Entre em contato: <a href='mailto:{{support_email}}'>{{support_email}}</a>
                            </p>
                        </div>
                        <div style='padding: 20px; text-align: center; color: #999; font-size: 12px;'>
                            <p>© 2025 {{app_name}}. Todos os direitos reservados.</p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "app_name", "support_email", "app_url" }
            },

            ["email_confirmation"] = new EmailTemplate
            {
                Name = "email_confirmation",
                Subject = "✅ Confirme seu email - {{app_name}}",
                Body = "Olá {{name}},\n\nPor favor, confirme seu endereço de email clicando no link abaixo:\n{{confirmation_link}}\n\n" +
                       "Este link expira em 24 horas.",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>✅ Confirme seu Email</h2>
                            <p>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666;'>Para começar a usar o {{app_name}}, precisamos confirmar seu email.</p>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{confirmation_link}}' style='background: #28a745; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Confirmar Email
                                </a>
                            </p>
                            <p style='color: #999; font-size: 14px;'>
                                Ou copie e cole este link: <br>
                                <span style='color: #007bff;'>{{confirmation_link}}</span>
                            </p>
                            <p style='color: #999; font-size: 12px;'>Este link expira em 24 horas.</p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "app_name", "confirmation_link" }
            },

            ["login_notification"] = new EmailTemplate
            {
                Name = "login_notification",
                Subject = "🔐 Novo login detectado - {{app_name}}",
                Body = "Olá {{name}},\n\nDetectamos um novo login na sua conta:\n\n" +
                       "Data/Hora: {{login_time}}\nDispositivo: {{device}}\nLocal: {{location}}\n\n" +
                       "Se não foi você, altere sua senha imediatamente.",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>🔐 Novo Login Detectado</h2>
                            <p>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666;'>Detectamos um novo login na sua conta:</p>
                            <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <table style='width: 100%; color: #666;'>
                                    <tr><td><strong>Data/Hora:</strong></td><td>{{login_time}}</td></tr>
                                    <tr><td><strong>Dispositivo:</strong></td><td>{{device}}</td></tr>
                                    <tr><td><strong>Local:</strong></td><td>{{location}}</td></tr>
                                </table>
                            </div>
                            <p style='color: #d9534f; font-weight: bold;'>
                                ⚠️ Se não foi você, <a href='{{reset_link}}' style='color: #d9534f;'>altere sua senha imediatamente</a>.
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "login_time", "device", "location", "reset_link" }
            },

            ["password_reset"] = new EmailTemplate
            {
                Name = "password_reset",
                Subject = "🔑 Redefinir sua senha - {{app_name}}",
                Body = "Olá {{name}},\n\nClique neste link para redefinir sua senha:\n{{reset_link}}\n\n" +
                       "Este link expira em {{expiry}} horas.\n\n" +
                       "Se você não solicitou esta redefinição, ignore este email.",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>🔑 Redefinir Senha</h2>
                            <p>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666;'>Recebemos uma solicitação para redefinir sua senha.</p>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{reset_link}}' style='background: #007bff; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Redefinir Senha
                                </a>
                            </p>
                            <p style='color: #666;'>Este link expira em <strong>{{expiry}} horas</strong>.</p>
                            <p style='color: #999; font-size: 14px;'>
                                Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "reset_link", "expiry" }
            },

            ["password_changed"] = new EmailTemplate
            {
                Name = "password_changed",
                Subject = "✅ Senha alterada com sucesso",
                Body = "Olá {{name}},\n\nSua senha foi alterada com sucesso em {{change_time}}.\n\n" +
                       "Se não foi você, entre em contato imediatamente: {{support_email}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #28a745;'>✅ Senha Alterada</h2>
                            <p>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666;'>Sua senha foi alterada com sucesso em <strong>{{change_time}}</strong>.</p>
                            <p style='color: #d9534f; font-weight: bold;'>
                                ⚠️ Se não foi você, entre em contato imediatamente:
                                <a href='mailto:{{support_email}}'>{{support_email}}</a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "change_time", "support_email" }
            },

            #endregion

            #region Engagement & Re-engagement

            ["inactive_user"] = new EmailTemplate
            {
                Name = "inactive_user",
                Subject = "😢 Sentimos sua falta, {{name}}!",
                Body = "Olá {{name}},\n\nNotamos que você não acessa o {{app_name}} há {{days_inactive}} dias.\n\n" +
                       "Temos novidades e melhorias esperando por você!\n\n" +
                       "Volte agora: {{app_url}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; color: white;'>
                            <h1 style='margin: 0; font-size: 32px;'>😢 Sentimos sua falta!</h1>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 18px; color: #333;'>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666; line-height: 1.6;'>
                                Notamos que você não acessa o <strong>{{app_name}}</strong> há <strong>{{days_inactive}} dias</strong>.
                                Sentimos sua falta! 💙
                            </p>
                            <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <h3 style='color: #f5576c; margin-top: 0;'>O que há de novo:</h3>
                                <ul style='color: #666; line-height: 1.8;'>
                                    <li>🚀 Nova interface redesenhada</li>
                                    <li>⚡ Performance 3x mais rápida</li>
                                    <li>🎨 Novos templates disponíveis</li>
                                    <li>📊 Relatórios avançados</li>
                                </ul>
                            </div>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{app_url}}' style='background: #f5576c; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Voltar ao {{app_name}}
                                </a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "app_name", "days_inactive", "app_url" }
            },

            ["weekly_summary"] = new EmailTemplate
            {
                Name = "weekly_summary",
                Subject = "📊 Seu resumo semanal - {{app_name}}",
                Body = "Olá {{name}},\n\nAqui está seu resumo da semana:\n\n" +
                       "Tarefas concluídas: {{tasks_completed}}\n" +
                       "Projetos ativos: {{active_projects}}\n" +
                       "Tempo economizado: {{time_saved}}\n\n" +
                       "Continue assim! 🚀",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>📊 Resumo Semanal</h2>
                            <p>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666;'>Aqui está o que você realizou esta semana:</p>
                            <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <div style='display: flex; justify-content: space-around; text-align: center;'>
                                    <div>
                                        <div style='font-size: 32px; color: #28a745; font-weight: bold;'>{{tasks_completed}}</div>
                                        <div style='color: #666; margin-top: 5px;'>Tarefas Concluídas</div>
                                    </div>
                                    <div>
                                        <div style='font-size: 32px; color: #007bff; font-weight: bold;'>{{active_projects}}</div>
                                        <div style='color: #666; margin-top: 5px;'>Projetos Ativos</div>
                                    </div>
                                    <div>
                                        <div style='font-size: 32px; color: #ffc107; font-weight: bold;'>{{time_saved}}h</div>
                                        <div style='color: #666; margin-top: 5px;'>Tempo Economizado</div>
                                    </div>
                                </div>
                            </div>
                            <p style='color: #666; text-align: center; font-size: 18px;'>
                                Continue assim! 🚀
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "tasks_completed", "active_projects", "time_saved" }
            },

            #endregion

            #region Marketing & Promotions

            ["promotion"] = new EmailTemplate
            {
                Name = "promotion",
                Subject = "🎁 {{promo_title}} - Oferta Especial!",
                Body = "Olá {{name}},\n\n{{promo_description}}\n\n" +
                       "Use o código: {{promo_code}}\n" +
                       "Válido até: {{expiry_date}}\n\n" +
                       "Aproveite: {{promo_link}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 40px; text-align: center;'>
                            <h1 style='margin: 0; font-size: 32px; color: #d63031;'>🎁 {{promo_title}}</h1>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 18px; color: #333;'>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666; line-height: 1.6; font-size: 16px;'>
                                {{promo_description}}
                            </p>
                            <div style='background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;'>
                                <p style='margin: 0; color: #856404;'>
                                    <strong>Código:</strong> <span style='font-size: 24px; font-weight: bold;'>{{promo_code}}</span>
                                </p>
                                <p style='margin: 10px 0 0 0; color: #856404;'>
                                    Válido até: <strong>{{expiry_date}}</strong>
                                </p>
                            </div>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{promo_link}}' style='background: #d63031; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Aproveitar Oferta
                                </a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "promo_title", "promo_description", "promo_code", "expiry_date", "promo_link" }
            },

            ["newsletter"] = new EmailTemplate
            {
                Name = "newsletter",
                Subject = "📰 {{newsletter_title}} - {{app_name}}",
                Body = "Olá {{name}},\n\n{{newsletter_content}}\n\n" +
                       "Leia mais: {{newsletter_link}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: #2c3e50; padding: 30px; text-align: center; color: white;'>
                            <h1 style='margin: 0; font-size: 28px;'>📰 {{newsletter_title}}</h1>
                            <p style='margin: 10px 0 0 0; opacity: 0.9;'>{{app_name}}</p>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 16px; color: #666; line-height: 1.8;'>
                                {{newsletter_content}}
                            </p>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{newsletter_link}}' style='background: #2c3e50; color: white; padding: 12px 25px;
                                text-decoration: none; border-radius: 5px; display: inline-block;'>
                                    Ler Newsletter Completa
                                </a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "newsletter_title", "app_name", "newsletter_content", "newsletter_link" }
            },

            ["upgrade_offer"] = new EmailTemplate
            {
                Name = "upgrade_offer",
                Subject = "⬆️ Faça upgrade e desbloqueie recursos premium!",
                Body = "Olá {{name}},\n\nVocê está aproveitando bem o {{app_name}}!\n\n" +
                       "Que tal fazer upgrade e desbloquear:\n{{features}}\n\n" +
                       "{{discount_text}}\n\n" +
                       "Fazer upgrade: {{upgrade_link}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;'>
                            <h1 style='margin: 0; font-size: 32px;'>⬆️ Upgrade Premium</h1>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 18px; color: #333;'>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666; line-height: 1.6;'>
                                Você está aproveitando bem o {{app_name}}! Que tal fazer upgrade e desbloquear ainda mais poder?
                            </p>
                            <div style='background: white; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                <h3 style='color: #667eea; margin-top: 0;'>Recursos Premium:</h3>
                                {{features}}
                            </div>
                            <div style='background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #155724; font-weight: bold;'>
                                    {{discount_text}}
                                </p>
                            </div>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{upgrade_link}}' style='background: #667eea; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Fazer Upgrade Agora
                                </a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "app_name", "features", "discount_text", "upgrade_link" }
            },

            #endregion

            #region Social & Community

            ["team_invite"] = new EmailTemplate
            {
                Name = "team_invite",
                Subject = "🤝 {{inviter_name}} convidou você para o {{team_name}}",
                Body = "Olá,\n\n{{inviter_name}} convidou você para participar da equipe {{team_name}} no {{app_name}}.\n\n" +
                       "Aceitar convite: {{invite_link}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>🤝 Convite para Equipe</h2>
                            <p style='color: #666; font-size: 16px;'>
                                <strong>{{inviter_name}}</strong> convidou você para participar da equipe
                                <strong>{{team_name}}</strong> no {{app_name}}.
                            </p>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{invite_link}}' style='background: #28a745; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Aceitar Convite
                                </a>
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "inviter_name", "team_name", "app_name", "invite_link" }
            },

            ["birthday"] = new EmailTemplate
            {
                Name = "birthday",
                Subject = "🎂 Feliz Aniversário, {{name}}!",
                Body = "Feliz Aniversário {{name}}!\n\nDesejamos um dia incrível! 🎉\n\n" +
                       "De presente, temos uma surpresa especial para você: {{gift_description}}\n\n" +
                       "Use o código: {{gift_code}}",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px; text-align: center; color: white;'>
                            <h1 style='margin: 0; font-size: 40px;'>🎂</h1>
                            <h2 style='margin: 10px 0;'>Feliz Aniversário!</h2>
                            <h3 style='margin: 0;'>{{name}}</h3>
                        </div>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <p style='font-size: 18px; color: #333; text-align: center;'>
                                Desejamos um dia incrível! 🎉
                            </p>
                            <div style='background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                                <p style='color: #666; margin-bottom: 20px;'>
                                    De presente, temos uma surpresa especial para você:
                                </p>
                                <h3 style='color: #f5576c; margin: 10px 0;'>{{gift_description}}</h3>
                                <p style='margin: 20px 0;'>
                                    <span style='background: #f093fb; color: white; padding: 10px 20px; border-radius: 5px;
                                    font-size: 20px; font-weight: bold;'>{{gift_code}}</span>
                                </p>
                            </div>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "gift_description", "gift_code" }
            },

            ["feedback_request"] = new EmailTemplate
            {
                Name = "feedback_request",
                Subject = "💭 Sua opinião é importante para nós!",
                Body = "Olá {{name}},\n\nComo está sendo sua experiência com o {{app_name}}?\n\n" +
                       "Adoraríamos ouvir seu feedback: {{feedback_link}}\n\n" +
                       "Leva apenas 2 minutos! 🙏",
                HtmlBody = @"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='padding: 40px; background: #f9f9f9;'>
                            <h2 style='color: #333;'>💭 Sua Opinião Importa!</h2>
                            <p style='font-size: 16px; color: #333;'>Olá <strong>{{name}}</strong>,</p>
                            <p style='color: #666; line-height: 1.6;'>
                                Como está sendo sua experiência com o {{app_name}}?
                                Adoraríamos ouvir seu feedback para continuar melhorando!
                            </p>
                            <p style='text-align: center; margin: 30px 0;'>
                                <a href='{{feedback_link}}' style='background: #007bff; color: white; padding: 15px 30px;
                                text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>
                                    Dar Feedback (2 min)
                                </a>
                            </p>
                            <p style='color: #999; text-align: center; font-size: 14px;'>
                                Seu feedback nos ajuda a criar uma experiência melhor para todos! 🙏
                            </p>
                        </div>
                    </div>",
                RequiredVariables = new List<string> { "name", "app_name", "feedback_link" }
            },

            #endregion

            #region System & Notifications

            ["notification"] = new EmailTemplate
            {
                Name = "notification",
                Subject = "{{title}}",
                Body = "{{message}}\n\n{{details}}",
                HtmlBody = "<h2>{{title}}</h2><p>{{message}}</p><div>{{details}}</div>",
                RequiredVariables = new List<string> { "title", "message" }
            },

            ["issue_assignment"] = new EmailTemplate
            {
                Name = "issue_assignment",
                Subject = "📋 Nova Issue Atribuída: {{issue_title}}",
                Body = "Olá {{user_name}},\n\nUma nova issue foi atribuída a você:\n\n" +
                       "Projeto: {{project_name}}\nIssue: {{issue_title}}\n\n" +
                       "Acesse o sistema para mais detalhes: {{app_url}}",
                HtmlBody = "<h2>Nova Issue Atribuída</h2>" +
                          "<p>Olá <strong>{{user_name}}</strong>,</p>" +
                          "<p>Uma nova issue foi atribuída a você:</p>" +
                          "<ul><li><strong>Projeto:</strong> {{project_name}}</li>" +
                          "<li><strong>Issue:</strong> {{issue_title}}</li></ul>" +
                          "<p><a href=\"{{app_url}}\">Acessar Sistema</a></p>",
                RequiredVariables = new List<string> { "user_name", "issue_title", "project_name", "app_url" }
            },

            ["task_deadline"] = new EmailTemplate
            {
                Name = "task_deadline",
                Subject = "⏰ Lembrete: Prazo de Tarefa Próximo",
                Body = "Olá {{user_name}},\n\nA tarefa '{{task_title}}' está próxima do prazo:\n" +
                       "Prazo: {{deadline}}\nFaltam {{days_left}} dias\n\n" +
                       "Por favor, verifique o status da tarefa.",
                HtmlBody = "<h2>⏰ Lembrete de Prazo</h2>" +
                          "<p>Olá <strong>{{user_name}}</strong>,</p>" +
                          "<p>A tarefa <strong>{{task_title}}</strong> está próxima do prazo:</p>" +
                          "<ul><li><strong>Prazo:</strong> {{deadline}}</li>" +
                          "<li><strong>Faltam:</strong> {{days_left}} dias</li></ul>" +
                          "<p>Por favor, verifique o status da tarefa.</p>",
                RequiredVariables = new List<string> { "user_name", "task_title", "deadline", "days_left" }
            }

            #endregion
        };
    }

    #endregion
}

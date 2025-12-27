namespace Arxis.API.Services;

/// <summary>
/// Notification service that integrates email, push notifications, etc.
/// Inspired by avx-events pub/sub system
/// </summary>
public interface INotificationService
{
    Task NotifyIssueAssignedAsync(string userId, string email, string issueTitle, string projectName);
    Task NotifyTaskDeadlineAsync(string userId, string email, string taskTitle, DateTime deadline);
    Task NotifyProjectUpdatedAsync(string userId, string email, string projectName);
    Task NotifyUserMentionedAsync(string userId, string email, string context);
    Task NotifySystemAlertAsync(string adminEmail, string alertType, string message);
}

public class NotificationService : INotificationService
{
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IEmailService emailService, ILogger<NotificationService> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task NotifyIssueAssignedAsync(string userId, string email, string issueTitle, string projectName)
    {
        _logger.LogInformation("Notifying user {UserId} about issue assignment: {IssueTitle}", userId, issueTitle);

        try
        {
            // Extract username from email
            var userName = email.Split('@')[0];

            // Send email notification
            await _emailService.SendIssueAssignmentEmailAsync(email, userName, issueTitle, projectName);

            // TODO: Add push notification
            // TODO: Add in-app notification
            // TODO: Add webhook notification (inspired by avx-events)
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send issue assignment notification to {UserId}", userId);
        }
    }

    public async Task NotifyTaskDeadlineAsync(string userId, string email, string taskTitle, DateTime deadline)
    {
        _logger.LogInformation("Notifying user {UserId} about task deadline: {TaskTitle}", userId, taskTitle);

        try
        {
            var userName = email.Split('@')[0];
            await _emailService.SendTaskDeadlineEmailAsync(email, userName, taskTitle, deadline);

            // TODO: Add push notification
            // TODO: Add calendar integration
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task deadline notification to {UserId}", userId);
        }
    }

    public async Task NotifyProjectUpdatedAsync(string userId, string email, string projectName)
    {
        _logger.LogInformation("Notifying user {UserId} about project update: {ProjectName}", userId, projectName);

        try
        {
            await _emailService.SendNotificationEmailAsync(
                email,
                $"Projeto Atualizado: {projectName}",
                $"O projeto {projectName} foi atualizado recentemente.",
                "Acesse o sistema para ver as últimas alterações."
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send project update notification to {UserId}", userId);
        }
    }

    public async Task NotifyUserMentionedAsync(string userId, string email, string context)
    {
        _logger.LogInformation("Notifying user {UserId} about mention", userId);

        try
        {
            await _emailService.SendNotificationEmailAsync(
                email,
                "Você foi mencionado",
                "Você foi mencionado em uma discussão.",
                context
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send mention notification to {UserId}", userId);
        }
    }

    public async Task NotifySystemAlertAsync(string adminEmail, string alertType, string message)
    {
        _logger.LogWarning("System alert: {AlertType} - {Message}", alertType, message);

        try
        {
            await _emailService.SendNotificationEmailAsync(
                adminEmail,
                $"🚨 Alerta do Sistema: {alertType}",
                message,
                $"Data/Hora: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send system alert to {AdminEmail}", adminEmail);
        }
    }
}

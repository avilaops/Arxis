using Arxis.API.Models;

namespace Arxis.API.Services;

/// <summary>
/// Interface for email service operations
/// Inspired by avx-cell email protocol library
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a simple email
    /// </summary>
    Task<bool> SendEmailAsync(EmailMessage message);

    /// <summary>
    /// Sends an email using a template
    /// </summary>
    Task<bool> SendTemplatedEmailAsync(string templateName, string to, Dictionary<string, string> variables);

    /// <summary>
    /// Sends a welcome email to new users
    /// </summary>
    Task<bool> SendWelcomeEmailAsync(string to, string userName);

    /// <summary>
    /// Sends a password reset email
    /// </summary>
    Task<bool> SendPasswordResetEmailAsync(string to, string userName, string resetLink);

    /// <summary>
    /// Sends a notification email
    /// </summary>
    Task<bool> SendNotificationEmailAsync(string to, string title, string message, string? details = null);

    /// <summary>
    /// Sends an issue assignment notification
    /// </summary>
    Task<bool> SendIssueAssignmentEmailAsync(string to, string userName, string issueTitle, string projectName);

    /// <summary>
    /// Sends a task deadline notification
    /// </summary>
    Task<bool> SendTaskDeadlineEmailAsync(string to, string userName, string taskTitle, DateTime deadline);

    /// <summary>
    /// Sends email confirmation
    /// </summary>
    Task<bool> SendEmailConfirmationAsync(string to, string userName, string confirmationLink);

    /// <summary>
    /// Sends login notification
    /// </summary>
    Task<bool> SendLoginNotificationAsync(string to, string userName, string loginTime, string device, string location, string resetLink);

    /// <summary>
    /// Sends password changed notification
    /// </summary>
    Task<bool> SendPasswordChangedAsync(string to, string userName, string changeTime);

    /// <summary>
    /// Sends inactive user re-engagement email
    /// </summary>
    Task<bool> SendInactiveUserEmailAsync(string to, string userName, int daysInactive);

    /// <summary>
    /// Sends weekly summary email
    /// </summary>
    Task<bool> SendWeeklySummaryEmailAsync(string to, string userName, int tasksCompleted, int activeProjects, int timeSaved);

    /// <summary>
    /// Sends promotion email
    /// </summary>
    Task<bool> SendPromotionEmailAsync(string to, string userName, string promoTitle, string promoDescription, string promoCode, string expiryDate, string promoLink);

    /// <summary>
    /// Sends newsletter
    /// </summary>
    Task<bool> SendNewsletterAsync(string to, string userName, string newsletterTitle, string newsletterContent, string newsletterLink);

    /// <summary>
    /// Sends upgrade offer
    /// </summary>
    Task<bool> SendUpgradeOfferAsync(string to, string userName, string features, string discountText, string upgradeLink);

    /// <summary>
    /// Sends team invitation
    /// </summary>
    Task<bool> SendTeamInviteAsync(string to, string inviterName, string teamName, string inviteLink);

    /// <summary>
    /// Sends birthday email
    /// </summary>
    Task<bool> SendBirthdayEmailAsync(string to, string userName, string giftDescription, string giftCode);

    /// <summary>
    /// Sends feedback request
    /// </summary>
    Task<bool> SendFeedbackRequestAsync(string to, string userName, string feedbackLink);

    /// <summary>
    /// Sends batch emails (queue system)
    /// </summary>
    Task<(int sent, int failed)> SendBatchEmailsAsync(IEnumerable<EmailMessage> messages);

    /// <summary>
    /// Verifies email address format
    /// </summary>
    bool IsValidEmail(string email);
}

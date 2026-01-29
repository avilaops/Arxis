using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Arxis.API.Models;
using Arxis.API.Services;

namespace Arxis.API.Controllers;

/// <summary>
/// Email management controller
/// Inspired by avx-cell email protocols
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    public EmailController(IEmailService emailService, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Send a simple email
    /// </summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] EmailMessage message)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (message.To == null || !message.To.Any())
            return BadRequest(new { error = "At least one recipient is required" });

        var result = await _emailService.SendEmailAsync(message);

        if (result)
            return Ok(new { success = true, message = "Email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send email" });
    }

    /// <summary>
    /// Send templated email
    /// </summary>
    [HttpPost("send-template")]
    public async Task<IActionResult> SendTemplatedEmail([FromBody] SendTemplateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _emailService.SendTemplatedEmailAsync(
            request.TemplateName,
            request.To,
            request.Variables
        );

        if (result)
            return Ok(new { success = true, message = "Email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send email" });
    }

    /// <summary>
    /// Send welcome email
    /// </summary>
    [HttpPost("send-welcome")]
    public async Task<IActionResult> SendWelcomeEmail([FromBody] WelcomeEmailRequest request)
    {
        var result = await _emailService.SendWelcomeEmailAsync(request.To, request.UserName);

        if (result)
            return Ok(new { success = true, message = "Welcome email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send welcome email" });
    }

    /// <summary>
    /// Send password reset email
    /// </summary>
    [HttpPost("send-password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> SendPasswordResetEmail([FromBody] PasswordResetEmailRequest request)
    {
        var result = await _emailService.SendPasswordResetEmailAsync(
            request.To,
            request.UserName,
            request.ResetLink
        );

        if (result)
            return Ok(new { success = true, message = "Password reset email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send password reset email" });
    }

    /// <summary>
    /// Send notification email
    /// </summary>
    [HttpPost("send-notification")]
    public async Task<IActionResult> SendNotificationEmail([FromBody] NotificationEmailRequest request)
    {
        var result = await _emailService.SendNotificationEmailAsync(
            request.To,
            request.Title,
            request.Message,
            request.Details
        );

        if (result)
            return Ok(new { success = true, message = "Notification email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send notification email" });
    }

    /// <summary>
    /// Send issue assignment notification
    /// </summary>
    [HttpPost("send-issue-assignment")]
    public async Task<IActionResult> SendIssueAssignmentEmail([FromBody] IssueAssignmentEmailRequest request)
    {
        var result = await _emailService.SendIssueAssignmentEmailAsync(
            request.To,
            request.UserName,
            request.IssueTitle,
            request.ProjectName
        );

        if (result)
            return Ok(new { success = true, message = "Issue assignment email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send issue assignment email" });
    }

    /// <summary>
    /// Send task deadline reminder
    /// </summary>
    [HttpPost("send-task-deadline")]
    public async Task<IActionResult> SendTaskDeadlineEmail([FromBody] TaskDeadlineEmailRequest request)
    {
        var result = await _emailService.SendTaskDeadlineEmailAsync(
            request.To,
            request.UserName,
            request.TaskTitle,
            request.Deadline
        );

        if (result)
            return Ok(new { success = true, message = "Task deadline email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send task deadline email" });
    }

    /// <summary>
    /// Send batch emails
    /// </summary>
    [HttpPost("send-batch")]
    public async Task<IActionResult> SendBatchEmails([FromBody] List<EmailMessage> messages)
    {
        if (!messages.Any())
            return BadRequest(new { error = "At least one email message is required" });

        var (sent, failed) = await _emailService.SendBatchEmailsAsync(messages);

        return Ok(new
        {
            success = true,
            sent,
            failed,
            total = messages.Count
        });
    }

    /// <summary>
    /// Validate email address
    /// </summary>
    [HttpGet("validate")]
    [AllowAnonymous]
    public IActionResult ValidateEmail([FromQuery] string email)
    {
        var isValid = _emailService.IsValidEmail(email);

        return Ok(new
        {
            email,
            isValid
        });
    }

    /// <summary>
    /// Send email confirmation
    /// </summary>
    [HttpPost("send-email-confirmation")]
    [AllowAnonymous]
    public async Task<IActionResult> SendEmailConfirmation([FromBody] EmailConfirmationRequest request)
    {
        var result = await _emailService.SendEmailConfirmationAsync(request.To, request.UserName, request.ConfirmationLink);

        if (result)
            return Ok(new { success = true, message = "Email confirmation sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send email confirmation" });
    }

    /// <summary>
    /// Send login notification
    /// </summary>
    [HttpPost("send-login-notification")]
    public async Task<IActionResult> SendLoginNotification([FromBody] LoginNotificationRequest request)
    {
        var result = await _emailService.SendLoginNotificationAsync(
            request.To, request.UserName, request.LoginTime, request.Device, request.Location, request.ResetLink);

        if (result)
            return Ok(new { success = true, message = "Login notification sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send login notification" });
    }

    /// <summary>
    /// Send password changed notification
    /// </summary>
    [HttpPost("send-password-changed")]
    public async Task<IActionResult> SendPasswordChanged([FromBody] PasswordChangedRequest request)
    {
        var result = await _emailService.SendPasswordChangedAsync(request.To, request.UserName, request.ChangeTime);

        if (result)
            return Ok(new { success = true, message = "Password changed notification sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send password changed notification" });
    }

    /// <summary>
    /// Send inactive user re-engagement email
    /// </summary>
    [HttpPost("send-inactive-user")]
    public async Task<IActionResult> SendInactiveUser([FromBody] InactiveUserRequest request)
    {
        var result = await _emailService.SendInactiveUserEmailAsync(request.To, request.UserName, request.DaysInactive);

        if (result)
            return Ok(new { success = true, message = "Inactive user email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send inactive user email" });
    }

    /// <summary>
    /// Send weekly summary
    /// </summary>
    [HttpPost("send-weekly-summary")]
    public async Task<IActionResult> SendWeeklySummary([FromBody] WeeklySummaryRequest request)
    {
        var result = await _emailService.SendWeeklySummaryEmailAsync(
            request.To, request.UserName, request.TasksCompleted, request.ActiveProjects, request.TimeSaved);

        if (result)
            return Ok(new { success = true, message = "Weekly summary sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send weekly summary" });
    }

    /// <summary>
    /// Send promotion email
    /// </summary>
    [HttpPost("send-promotion")]
    public async Task<IActionResult> SendPromotion([FromBody] PromotionRequest request)
    {
        var result = await _emailService.SendPromotionEmailAsync(
            request.To, request.UserName, request.PromoTitle, request.PromoDescription,
            request.PromoCode, request.ExpiryDate, request.PromoLink);

        if (result)
            return Ok(new { success = true, message = "Promotion email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send promotion email" });
    }

    /// <summary>
    /// Send newsletter
    /// </summary>
    [HttpPost("send-newsletter")]
    public async Task<IActionResult> SendNewsletter([FromBody] NewsletterRequest request)
    {
        var result = await _emailService.SendNewsletterAsync(
            request.To, request.UserName, request.NewsletterTitle, request.NewsletterContent, request.NewsletterLink);

        if (result)
            return Ok(new { success = true, message = "Newsletter sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send newsletter" });
    }

    /// <summary>
    /// Send upgrade offer
    /// </summary>
    [HttpPost("send-upgrade-offer")]
    public async Task<IActionResult> SendUpgradeOffer([FromBody] UpgradeOfferRequest request)
    {
        var result = await _emailService.SendUpgradeOfferAsync(
            request.To, request.UserName, request.Features, request.DiscountText, request.UpgradeLink);

        if (result)
            return Ok(new { success = true, message = "Upgrade offer sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send upgrade offer" });
    }

    /// <summary>
    /// Send team invitation
    /// </summary>
    [HttpPost("send-team-invite")]
    public async Task<IActionResult> SendTeamInvite([FromBody] TeamInviteRequest request)
    {
        var result = await _emailService.SendTeamInviteAsync(
            request.To, request.InviterName, request.TeamName, request.InviteLink);

        if (result)
            return Ok(new { success = true, message = "Team invitation sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send team invitation" });
    }

    /// <summary>
    /// Send birthday email
    /// </summary>
    [HttpPost("send-birthday")]
    public async Task<IActionResult> SendBirthday([FromBody] BirthdayRequest request)
    {
        var result = await _emailService.SendBirthdayEmailAsync(
            request.To, request.UserName, request.GiftDescription, request.GiftCode);

        if (result)
            return Ok(new { success = true, message = "Birthday email sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send birthday email" });
    }

    /// <summary>
    /// Send feedback request
    /// </summary>
    [HttpPost("send-feedback-request")]
    public async Task<IActionResult> SendFeedbackRequest([FromBody] FeedbackRequestRequest request)
    {
        var result = await _emailService.SendFeedbackRequestAsync(request.To, request.UserName, request.FeedbackLink);

        if (result)
            return Ok(new { success = true, message = "Feedback request sent successfully" });

        return StatusCode(500, new { success = false, error = "Failed to send feedback request" });
    }


}

#region Request Models

public class SendTemplateRequest
{
    public string TemplateName { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public Dictionary<string, string> Variables { get; set; } = new();
}

public class WelcomeEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

public class PasswordResetEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string ResetLink { get; set; } = string.Empty;
}

public class NotificationEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public class IssueAssignmentEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string IssueTitle { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
}

public class TaskDeadlineEmailRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string TaskTitle { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
}

public class EmailConfirmationRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string ConfirmationLink { get; set; } = string.Empty;
}

public class LoginNotificationRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string LoginTime { get; set; } = string.Empty;
    public string Device { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string ResetLink { get; set; } = string.Empty;
}

public class PasswordChangedRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string ChangeTime { get; set; } = string.Empty;
}

public class InactiveUserRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int DaysInactive { get; set; }
}

public class WeeklySummaryRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int TasksCompleted { get; set; }
    public int ActiveProjects { get; set; }
    public int TimeSaved { get; set; }
}

public class PromotionRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string PromoTitle { get; set; } = string.Empty;
    public string PromoDescription { get; set; } = string.Empty;
    public string PromoCode { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string PromoLink { get; set; } = string.Empty;
}

public class NewsletterRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string NewsletterTitle { get; set; } = string.Empty;
    public string NewsletterContent { get; set; } = string.Empty;
    public string NewsletterLink { get; set; } = string.Empty;
}

public class UpgradeOfferRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Features { get; set; } = string.Empty;
    public string DiscountText { get; set; } = string.Empty;
    public string UpgradeLink { get; set; } = string.Empty;
}

public class TeamInviteRequest
{
    public string To { get; set; } = string.Empty;
    public string InviterName { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string InviteLink { get; set; } = string.Empty;
}

public class BirthdayRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string GiftDescription { get; set; } = string.Empty;
    public string GiftCode { get; set; } = string.Empty;
}

public class FeedbackRequestRequest
{
    public string To { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FeedbackLink { get; set; } = string.Empty;
}

#endregion

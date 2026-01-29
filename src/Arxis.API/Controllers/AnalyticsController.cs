using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Arxis.API.Services;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analytics;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IAnalyticsService analytics, ILogger<AnalyticsController> logger)
    {
        _analytics = analytics;
        _logger = logger;
    }

    /// <summary>
    /// Track plan interest (when user views pricing page or clicks on a plan)
    /// </summary>
    [HttpPost("plan-interest")]
    [AllowAnonymous]
    public IActionResult TrackPlanInterest([FromBody] PlanInterestRequest request)
    {
        _analytics.TrackPlanInterest(
            request.UserId ?? "anonymous",
            request.PlanName,
            request.PlanPrice
        );

        return Ok(new { success = true });
    }

    /// <summary>
    /// Track upgrade intent (when user clicks "Upgrade" button)
    /// </summary>
    [HttpPost("upgrade-intent")]
    public IActionResult TrackUpgradeIntent([FromBody] UpgradeIntentRequest request)
    {
        _analytics.TrackUpgradeIntent(request.UserId, request.FromPlan, request.ToPlan);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Track checkout started
    /// </summary>
    [HttpPost("checkout-started")]
    public IActionResult TrackCheckoutStarted([FromBody] CheckoutRequest request)
    {
        _analytics.TrackCheckoutStarted(request.UserId, request.PlanName, request.Amount);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Track checkout completed (successful purchase)
    /// </summary>
    [HttpPost("checkout-completed")]
    public IActionResult TrackCheckoutCompleted([FromBody] CheckoutCompletedRequest request)
    {
        _analytics.TrackCheckoutCompleted(
            request.UserId,
            request.PlanName,
            request.Amount,
            request.PaymentMethod
        );

        return Ok(new { success = true, message = "💰 Venda registrada!" });
    }

    /// <summary>
    /// Track checkout abandoned
    /// </summary>
    [HttpPost("checkout-abandoned")]
    public IActionResult TrackCheckoutAbandoned([FromBody] CheckoutAbandonedRequest request)
    {
        _analytics.TrackCheckoutAbandoned(
            request.UserId,
            request.PlanName,
            request.Amount,
            request.Reason
        );

        return Ok(new { success = true });
    }

    /// <summary>
    /// Track feature usage
    /// </summary>
    [HttpPost("feature-used")]
    public IActionResult TrackFeatureUsed([FromBody] FeatureUsedRequest request)
    {
        _analytics.TrackFeatureUsed(request.UserId, request.FeatureName, request.Properties);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Track funnel step (for conversion funnels)
    /// </summary>
    [HttpPost("funnel-step")]
    [AllowAnonymous]
    public IActionResult TrackFunnelStep([FromBody] FunnelStepRequest request)
    {
        _analytics.TrackFunnelStep(
            request.UserId ?? "anonymous",
            request.FunnelName,
            request.StepName,
            request.Properties
        );

        return Ok(new { success = true });
    }

    /// <summary>
    /// Track email opened (webhook from email provider)
    /// </summary>
    [HttpPost("email-opened")]
    [AllowAnonymous]
    public IActionResult TrackEmailOpened([FromBody] EmailEventRequest request)
    {
        _analytics.TrackEmailOpened(request.To, request.Template);
        return Ok();
    }

    /// <summary>
    /// Track email link clicked
    /// </summary>
    [HttpPost("email-clicked")]
    [AllowAnonymous]
    public IActionResult TrackEmailClicked([FromBody] EmailClickRequest request)
    {
        _analytics.TrackEmailClicked(request.To, request.Template, request.LinkUrl);
        return Ok();
    }
}

#region Request Models

public class PlanInterestRequest
{
    public string? UserId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public decimal PlanPrice { get; set; }
}

public class UpgradeIntentRequest
{
    public string UserId { get; set; } = string.Empty;
    public string FromPlan { get; set; } = string.Empty;
    public string ToPlan { get; set; } = string.Empty;
}

public class CheckoutRequest
{
    public string UserId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class CheckoutCompletedRequest
{
    public string UserId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
}

public class CheckoutAbandonedRequest
{
    public string UserId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class FeatureUsedRequest
{
    public string UserId { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public Dictionary<string, string>? Properties { get; set; }
}

public class FunnelStepRequest
{
    public string? UserId { get; set; }
    public string FunnelName { get; set; } = string.Empty;
    public string StepName { get; set; } = string.Empty;
    public Dictionary<string, string>? Properties { get; set; }
}

public class EmailEventRequest
{
    public string To { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
}

public class EmailClickRequest
{
    public string To { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;
    public string LinkUrl { get; set; } = string.Empty;
}

#endregion

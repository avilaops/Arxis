namespace Arxis.API.Services;

public interface IAnalyticsService
{
    // User Events
    void TrackUserSignup(string userId, string email, string plan = "free");
    void TrackUserLogin(string userId);
    void TrackUserLogout(string userId);

    // Business Events
    void TrackPlanInterest(string userId, string planName, decimal planPrice);
    void TrackUpgradeIntent(string userId, string fromPlan, string toPlan);
    void TrackCheckoutStarted(string userId, string planName, decimal amount);
    void TrackCheckoutCompleted(string userId, string planName, decimal amount, string paymentMethod);
    void TrackCheckoutAbandoned(string userId, string planName, decimal amount, string reason);

    // Feature Usage
    void TrackFeatureUsed(string userId, string featureName, Dictionary<string, string>? properties = null);
    void TrackProjectCreated(string userId, string projectId, string projectType);
    void TrackIssueCreated(string userId, string issueId, string priority);
    void TrackDocumentUploaded(string userId, string documentId, long fileSize, string fileType);

    // Email Events
    void TrackEmailSent(string to, string template, bool success, string? errorMessage = null);
    void TrackEmailOpened(string to, string template);
    void TrackEmailClicked(string to, string template, string linkUrl);

    // Performance
    void TrackApiRequest(string endpoint, int statusCode, long durationMs);
    void TrackException(Exception exception, Dictionary<string, string>? properties = null);

    // Conversion Funnel
    void TrackFunnelStep(string userId, string funnelName, string stepName, Dictionary<string, string>? properties = null);
}

public class AnalyticsService : IAnalyticsService
{
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(ILogger<AnalyticsService> logger)
    {
        _logger = logger;
    }

    public void TrackUserSignup(string userId, string email, string plan = "free")
    {
        LogEvent("UserSignup", new
        {
            userId,
            email,
            plan,
            signupDate = DateTime.UtcNow
        });
    }

    public void TrackUserLogin(string userId)
    {
        LogEvent("UserLogin", new
        {
            userId,
            loginTime = DateTime.UtcNow
        });
    }

    public void TrackUserLogout(string userId)
    {
        LogEvent("UserLogout", new { userId });
    }

    public void TrackPlanInterest(string userId, string planName, decimal planPrice)
    {
        LogEvent("PlanInterest", new
        {
            userId,
            planName,
            planPrice,
            timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Plan interest tracked: User {UserId} interested in {PlanName} (${Price})",
            userId, planName, planPrice);
    }

    public void TrackUpgradeIntent(string userId, string fromPlan, string toPlan)
    {
        LogEvent("UpgradeIntent", new
        {
            userId,
            fromPlan,
            toPlan,
            timestamp = DateTime.UtcNow
        });
        _logger.LogInformation("Upgrade intent: User {UserId} from {FromPlan} to {ToPlan}",
            userId, fromPlan, toPlan);
    }

    public void TrackCheckoutStarted(string userId, string planName, decimal amount)
    {
        LogEvent("CheckoutStarted", new
        {
            userId,
            planName,
            amount,
            currency = "USD"
        });
        _logger.LogInformation("🛒 Checkout started: User {UserId}, Plan {PlanName}, ${Amount}",
            userId, planName, amount);
    }

    public void TrackCheckoutCompleted(string userId, string planName, decimal amount, string paymentMethod)
    {
        LogEvent("CheckoutCompleted", new
        {
            userId,
            planName,
            amount,
            currency = "USD",
            paymentMethod
        });
        _logger.LogInformation("💰 VENDA! User {UserId} comprou {PlanName} por ${Amount} via {PaymentMethod}",
            userId, planName, amount, paymentMethod);
    }

    public void TrackCheckoutAbandoned(string userId, string planName, decimal amount, string reason)
    {
        LogEvent("CheckoutAbandoned", new
        {
            userId,
            planName,
            amount,
            reason,
            timestamp = DateTime.UtcNow
        });
        _logger.LogWarning("❌ Checkout abandonado: User {UserId}, Plan {PlanName}, Razão: {Reason}",
            userId, planName, reason);
    }

    public void TrackFeatureUsed(string userId, string featureName, Dictionary<string, string>? properties = null)
    {
        var payload = new Dictionary<string, string>(properties ?? new Dictionary<string, string>())
        {
            ["userId"] = userId,
            ["featureName"] = featureName,
            ["timestamp"] = DateTime.UtcNow.ToString("O")
        };

        LogEvent("FeatureUsed", payload);
    }

    public void TrackProjectCreated(string userId, string projectId, string projectType)
    {
        LogEvent("ProjectCreated", new { userId, projectId, projectType });
    }

    public void TrackIssueCreated(string userId, string issueId, string priority)
    {
        LogEvent("IssueCreated", new { userId, issueId, priority });
    }

    public void TrackDocumentUploaded(string userId, string documentId, long fileSize, string fileType)
    {
        LogEvent("DocumentUploaded", new
        {
            userId,
            documentId,
            fileType,
            fileSizeBytes = fileSize
        });
    }

    public void TrackEmailSent(string to, string template, bool success, string? errorMessage = null)
    {
        LogEvent("EmailSent", new
        {
            to,
            template,
            success,
            errorMessage
        });
    }

    public void TrackEmailOpened(string to, string template)
    {
        LogEvent("EmailOpened", new
        {
            to,
            template,
            openedAt = DateTime.UtcNow
        });
    }

    public void TrackEmailClicked(string to, string template, string linkUrl)
    {
        LogEvent("EmailClicked", new { to, template, linkUrl });
    }

    public void TrackApiRequest(string endpoint, int statusCode, long durationMs)
    {
        _logger.LogInformation("API request tracked {Endpoint} {StatusCode} in {Duration}ms",
            endpoint, statusCode, durationMs);
    }

    public void TrackException(Exception exception, Dictionary<string, string>? properties = null)
    {
        if (properties != null && properties.Count > 0)
        {
            _logger.LogError(exception, "Exception tracked in analytics with context {@Properties}", properties);
        }
        else
        {
            _logger.LogError(exception, "Exception tracked in analytics");
        }
    }

    public void TrackFunnelStep(string userId, string funnelName, string stepName, Dictionary<string, string>? properties = null)
    {
        var props = properties ?? new Dictionary<string, string>();
        props["userId"] = userId;
        props["funnelName"] = funnelName;
        props["stepName"] = stepName;
        props["timestamp"] = DateTime.UtcNow.ToString("O");

        LogEvent("FunnelStep", props);

        _logger.LogInformation("Funnel step: {UserId} → {FunnelName} → {StepName}",
            userId, funnelName, stepName);
    }

    private void LogEvent(string eventName, object payload)
    {
        _logger.LogInformation("Analytics event {EventName} {@Payload}", eventName, payload);
    }
}

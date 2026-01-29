using Microsoft.Extensions.Configuration;

namespace Arxis.API.Configuration;

/// <summary>
/// Centralized access to external services configuration
/// </summary>
public class ExternalServicesConfig
{
    private readonly IConfiguration _configuration;

    public ExternalServicesConfig(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // GitHub
    public string GitHubUsername => _configuration["ExternalServices:GitHub:Username"] ?? string.Empty;
    public string GitHubToken => _configuration["ExternalServices:GitHub:Token"] ?? string.Empty;

    // OpenAI
    public string OpenAIApiKey => _configuration["ExternalServices:OpenAI:ApiKey"] ?? string.Empty;
    public string OpenAIModel => _configuration["ExternalServices:OpenAI:Model"] ?? "gpt-4";

    // Google Cloud
    public string GoogleApiToken => _configuration["ExternalServices:GoogleCloud:ApiToken"] ?? string.Empty;
    public string GoogleClientId => _configuration["ExternalServices:GoogleCloud:ClientId"] ?? string.Empty;
    public string GoogleSecretKey => _configuration["ExternalServices:GoogleCloud:SecretKey"] ?? string.Empty;
    public string GoogleMapsId => _configuration["ExternalServices:GoogleCloud:MapsId"] ?? string.Empty;

    // Sentry
    public string SentryDsn => _configuration["ExternalServices:Sentry:Dsn"] ?? string.Empty;
    public string SentryEnvironment => _configuration["ExternalServices:Sentry:Environment"] ?? "Development";

    // Stripe
    public string StripeApiKey => _configuration["ExternalServices:Stripe:ApiKey"] ?? string.Empty;
    public string StripeWebhookSecret => _configuration["ExternalServices:Stripe:WebhookSecret"] ?? string.Empty;

    // PayPal
    public string PayPalClientId => _configuration["ExternalServices:PayPal:ClientId"] ?? string.Empty;
    public string PayPalSecret => _configuration["ExternalServices:PayPal:Secret"] ?? string.Empty;

    // Email
    public string EmailSmtpServer => _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
    public int EmailSmtpPort => int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587;
    public bool EmailUseSsl => bool.TryParse(_configuration["Email:UseSsl"], out var useSsl) && useSsl;
    public string EmailFromAddress => _configuration["Email:FromEmail"] ?? string.Empty;
    public string EmailFromName => _configuration["Email:FromName"] ?? "ARXIS";
    public string EmailUsername => _configuration["Email:Username"] ?? string.Empty;
    public string EmailPassword => _configuration["Email:Password"] ?? string.Empty;

    // Microsoft Clarity
    public string ClarityApiToken => _configuration["Clarity:ApiToken"] ?? Environment.GetEnvironmentVariable("CLARITY_API_TOKEN") ?? string.Empty;
    public string ClarityProjectId => _configuration["Clarity:ProjectId"] ?? Environment.GetEnvironmentVariable("CLARITY_PROJECT_ID") ?? string.Empty;

    // Company Info
    public string CompanyName => _configuration["CompanyInfo:Name"] ?? "Avila Soluções Empresariais";
    public string CompanyWebsite => _configuration["CompanyInfo:Website"] ?? "https://avila.inc";
    public string SupportEmail => _configuration["CompanyInfo:SupportEmail"] ?? "support@avila.inc";
    public string DocumentationLink => _configuration["CompanyInfo:Links:Documentation"] ?? "https://docs.avila.inc";
    public string LinkedInLink => _configuration["CompanyInfo:Links:LinkedIn"] ?? "https://linkedin.com/company/avila-devops";
    public string DevelopmentLink => _configuration["CompanyInfo:Links:Development"] ?? "https://avilaops.com";
}

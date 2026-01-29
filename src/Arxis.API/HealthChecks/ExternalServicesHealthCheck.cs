using Microsoft.Extensions.Diagnostics.HealthChecks;
using Arxis.API.Configuration;

namespace Arxis.API.HealthChecks;

/// <summary>
/// Health check para verificar conectividade com serviços externos
/// </summary>
public class ExternalServicesHealthCheck : IHealthCheck
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ExternalServicesConfig _servicesConfig;

    public ExternalServicesHealthCheck(
        HttpClient httpClient,
        IConfiguration configuration,
        ExternalServicesConfig servicesConfig)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _servicesConfig = servicesConfig;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var data = new Dictionary<string, object>();
        var overallHealthy = true;

        // Check Clarity Service
        try
        {
            var clarityConfigured = !string.IsNullOrEmpty(_servicesConfig.ClarityApiToken);
            data["Clarity"] = clarityConfigured ? "Configured" : "Not Configured";
        }
        catch
        {
            data["Clarity"] = "Error checking configuration";
            overallHealthy = false;
        }

        // Check Email Service Configuration
        var emailConfigured = !string.IsNullOrEmpty(_configuration["Email:SmtpServer"]);
        data["EmailService"] = emailConfigured ? "Configured" : "Not Configured";

        var status = overallHealthy ? HealthStatus.Healthy : HealthStatus.Degraded;

        return await Task.FromResult(new HealthCheckResult(
            status,
            description: "External services connectivity check",
            data: data));
    }
}

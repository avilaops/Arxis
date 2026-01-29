using Microsoft.FeatureManagement;

namespace Arxis.API.Services;

/// <summary>
/// Interface for feature flag service
/// </summary>
public interface IFeatureFlagService
{
    Task<bool> IsEnabledAsync(string featureName);
    Task<bool> IsEnabledAsync(string featureName, string userId);
    Task<IEnumerable<string>> GetEnabledFeaturesAsync();
}

/// <summary>
/// Feature flag service using Azure App Configuration and Microsoft.FeatureManagement
/// </summary>
public class FeatureFlagService : IFeatureFlagService
{
    private readonly IFeatureManager _featureManager;
    private readonly ILogger<FeatureFlagService> _logger;

    public FeatureFlagService(IFeatureManager featureManager, ILogger<FeatureFlagService> logger)
    {
        _featureManager = featureManager;
        _logger = logger;
    }

    public async Task<bool> IsEnabledAsync(string featureName)
    {
        try
        {
            var isEnabled = await _featureManager.IsEnabledAsync(featureName);
            _logger.LogDebug("Feature flag '{FeatureName}' is {Status}",
                featureName, isEnabled ? "enabled" : "disabled");
            return isEnabled;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking feature flag '{FeatureName}'", featureName);
            return false; // Default to disabled on error
        }
    }

    public async Task<bool> IsEnabledAsync(string featureName, string userId)
    {
        try
        {
            var isEnabled = await _featureManager.IsEnabledAsync(featureName, userId);
            _logger.LogDebug("Feature flag '{FeatureName}' for user '{UserId}' is {Status}",
                featureName, userId, isEnabled ? "enabled" : "disabled");
            return isEnabled;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking feature flag '{FeatureName}' for user '{UserId}'",
                featureName, userId);
            return false; // Default to disabled on error
        }
    }

    public async Task<IEnumerable<string>> GetEnabledFeaturesAsync()
    {
        // Note: This is a simplified implementation
        // In a real scenario, you'd need to enumerate all known feature flags
        var knownFeatures = new[]
        {
            "BetaFeatures",
            "AdvancedAnalytics",
            "RealTimeNotifications",
            "PBRRendering",
            "ArIntegration",
            "MultiTenant",
            "AuditLogging"
        };

        var enabledFeatures = new List<string>();

        foreach (var feature in knownFeatures)
        {
            if (await IsEnabledAsync(feature))
            {
                enabledFeatures.Add(feature);
            }
        }

        _logger.LogDebug("Found {Count} enabled features: {Features}",
            enabledFeatures.Count, string.Join(", ", enabledFeatures));

        return enabledFeatures;
    }
}

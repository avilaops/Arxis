using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Arxis.API.HealthChecks;

/// <summary>
/// Health check para verificar espaço em disco disponível
/// </summary>
public class DiskSpaceHealthCheck : IHealthCheck
{
    private readonly long _minimumFreeBytesThreshold;

    public DiskSpaceHealthCheck(long minimumFreeBytesGB = 1)
    {
        _minimumFreeBytesThreshold = minimumFreeBytesGB * 1024L * 1024L * 1024L; // Convert GB to bytes
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var drive = DriveInfo.GetDrives()
                .FirstOrDefault(d => d.IsReady && d.DriveType == DriveType.Fixed);

            if (drive == null)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("No fixed drives found"));
            }

            var freeSpaceGB = drive.AvailableFreeSpace / 1024.0 / 1024.0 / 1024.0;
            var totalSpaceGB = drive.TotalSize / 1024.0 / 1024.0 / 1024.0;
            var usedPercentage = ((totalSpaceGB - freeSpaceGB) / totalSpaceGB) * 100;

            var data = new Dictionary<string, object>
            {
                { "DriveName", drive.Name },
                { "FreeSpaceGB", Math.Round(freeSpaceGB, 2) },
                { "TotalSpaceGB", Math.Round(totalSpaceGB, 2) },
                { "UsedPercentage", Math.Round(usedPercentage, 2) }
            };

            var status = drive.AvailableFreeSpace >= _minimumFreeBytesThreshold
                ? HealthStatus.Healthy
                : drive.AvailableFreeSpace >= (_minimumFreeBytesThreshold / 2)
                    ? HealthStatus.Degraded
                    : HealthStatus.Unhealthy;

            return Task.FromResult(new HealthCheckResult(
                status,
                description: $"Drive {drive.Name}: {freeSpaceGB:F2}GB free of {totalSpaceGB:F2}GB",
                data: data));
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Error checking disk space", ex));
        }
    }
}

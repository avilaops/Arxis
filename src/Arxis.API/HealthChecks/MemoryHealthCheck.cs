using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;

namespace Arxis.API.HealthChecks;

/// <summary>
/// Health check para verificar uso de memória do processo
/// </summary>
public class MemoryHealthCheck : IHealthCheck
{
    private readonly long _threshold;

    public MemoryHealthCheck(long threshold = 1024L * 1024L * 1024L) // 1GB default
    {
        _threshold = threshold;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var process = Process.GetCurrentProcess();
        var allocatedBytes = GC.GetTotalMemory(forceFullCollection: false);
        var workingSet = process.WorkingSet64;

        var data = new Dictionary<string, object>
        {
            { "AllocatedMB", allocatedBytes / 1024 / 1024 },
            { "WorkingSetMB", workingSet / 1024 / 1024 },
            { "Gen0Collections", GC.CollectionCount(0) },
            { "Gen1Collections", GC.CollectionCount(1) },
            { "Gen2Collections", GC.CollectionCount(2) }
        };

        var status = allocatedBytes < _threshold
            ? HealthStatus.Healthy
            : HealthStatus.Degraded;

        return Task.FromResult(new HealthCheckResult(
            status,
            description: $"Memory usage: {allocatedBytes / 1024 / 1024}MB / {_threshold / 1024 / 1024}MB",
            data: data));
    }
}

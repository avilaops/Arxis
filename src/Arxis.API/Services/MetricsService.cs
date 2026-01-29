using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace Arxis.API.Services;

/// <summary>
/// Service for custom application metrics and observability
/// </summary>
public class MetricsService : IDisposable
{
    private readonly Meter _meter;
    private readonly Counter<long> _requestsCounter;
    private readonly Histogram<double> _requestDuration;
    private readonly Counter<long> _errorsCounter;
    private readonly UpDownCounter<long> _activeConnections;
    private readonly Counter<long> _cacheHits;
    private readonly Counter<long> _cacheMisses;
    private readonly ILogger<MetricsService> _logger;

    public MetricsService(ILogger<MetricsService> logger)
    {
        _logger = logger;
        _meter = new Meter("Arxis.API", "1.0.0");

        // HTTP Request metrics
        _requestsCounter = _meter.CreateCounter<long>(
            "arxis_http_requests_total",
            description: "Total number of HTTP requests");

        _requestDuration = _meter.CreateHistogram<double>(
            "arxis_http_request_duration_seconds",
            description: "HTTP request duration in seconds");

        _errorsCounter = _meter.CreateCounter<long>(
            "arxis_http_errors_total",
            description: "Total number of HTTP errors");

        // Connection metrics
        _activeConnections = _meter.CreateUpDownCounter<long>(
            "arxis_active_connections",
            description: "Number of active connections");

        // Cache metrics
        _cacheHits = _meter.CreateCounter<long>(
            "arxis_cache_hits_total",
            description: "Total number of cache hits");

        _cacheMisses = _meter.CreateCounter<long>(
            "arxis_cache_misses_total",
            description: "Total number of cache misses");

        _logger.LogInformation("Metrics service initialized with meter: {MeterName}", _meter.Name);
    }

    // HTTP Request metrics
    public void RecordHttpRequest(string method, string path, int statusCode, TimeSpan duration)
    {
        var tags = new TagList
        {
            { "method", method },
            { "path", path },
            { "status_code", statusCode.ToString() }
        };

        _requestsCounter.Add(1, tags);
        _requestDuration.Record(duration.TotalSeconds, tags);

        if (statusCode >= 400)
        {
            _errorsCounter.Add(1, tags);
        }

        _logger.LogDebug("Recorded HTTP request: {Method} {Path} {StatusCode} in {Duration}ms",
            method, path, statusCode, duration.TotalMilliseconds);
    }

    // Connection metrics
    public void IncrementActiveConnections()
    {
        _activeConnections.Add(1);
        _logger.LogDebug("Incremented active connections");
    }

    public void DecrementActiveConnections()
    {
        _activeConnections.Add(-1);
        _logger.LogDebug("Decremented active connections");
    }

    // Cache metrics
    public void RecordCacheHit(string cacheKey)
    {
        _cacheHits.Add(1, new TagList { { "cache_key", cacheKey } });
        _logger.LogDebug("Recorded cache hit for key: {CacheKey}", cacheKey);
    }

    public void RecordCacheMiss(string cacheKey)
    {
        _cacheMisses.Add(1, new TagList { { "cache_key", cacheKey } });
        _logger.LogDebug("Recorded cache miss for key: {CacheKey}", cacheKey);
    }

    // Business metrics
    public void RecordBusinessMetric(string metricName, long value, params KeyValuePair<string, object?>[] tags)
    {
        var counter = _meter.CreateCounter<long>($"arxis_business_{metricName}_total");
        var tagList = new TagList();

        foreach (var tag in tags)
        {
            tagList.Add(tag.Key, tag.Value?.ToString() ?? string.Empty);
        }

        counter.Add(value, tagList);
        _logger.LogDebug("Recorded business metric: {MetricName} = {Value}", metricName, value);
    }

    // Performance metrics
    public void RecordPerformanceMetric(string operation, TimeSpan duration, bool success = true)
    {
        var histogram = _meter.CreateHistogram<double>($"arxis_performance_{operation}_duration_seconds");
        var tags = new TagList
        {
            { "operation", operation },
            { "success", success.ToString() }
        };

        histogram.Record(duration.TotalSeconds, tags);
        _logger.LogDebug("Recorded performance metric: {Operation} took {Duration}ms (Success: {Success})",
            operation, duration.TotalMilliseconds, success);
    }

    public void Dispose()
    {
        _meter.Dispose();
        _logger.LogInformation("Metrics service disposed");
    }
}

/// <summary>
/// Middleware for recording HTTP metrics
/// </summary>
public class MetricsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly MetricsService _metricsService;
    private readonly ILogger<MetricsMiddleware> _logger;

    public MetricsMiddleware(
        RequestDelegate next,
        MetricsService metricsService,
        ILogger<MetricsMiddleware> logger)
    {
        _next = next;
        _metricsService = metricsService;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;

        // Track active connections
        _metricsService.IncrementActiveConnections();

        try
        {
            await _next(context);
        }
        finally
        {
            var duration = DateTime.UtcNow - startTime;

            // Record HTTP metrics
            _metricsService.RecordHttpRequest(
                context.Request.Method,
                context.Request.Path.Value ?? "/",
                context.Response.StatusCode,
                duration);

            // Track active connections
            _metricsService.DecrementActiveConnections();

            _logger.LogDebug("HTTP request completed: {Method} {Path} {StatusCode} in {Duration}ms",
                context.Request.Method,
                context.Request.Path.Value,
                context.Response.StatusCode,
                duration.TotalMilliseconds);
        }
    }
}

/// <summary>
/// Extension methods for metrics
/// </summary>
public static class MetricsExtensions
{
    public static IApplicationBuilder UseMetrics(this IApplicationBuilder app)
    {
        return app.UseMiddleware<MetricsMiddleware>();
    }

    public static IServiceCollection AddMetrics(this IServiceCollection services)
    {
        services.AddSingleton<MetricsService>();
        return services;
    }
}

using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using Polly.Timeout;

namespace Arxis.API.Services;

/// <summary>
/// Resilience service using Polly for retry, circuit breaker, and timeout policies
/// </summary>
public class ResilienceService : IResilienceService
{
    private readonly ILogger<ResilienceService> _logger;

    // Retry policy - exponential backoff
    private readonly AsyncRetryPolicy _retryPolicy = Policy
        .Handle<Exception>(ex => !IsTransientException(ex))
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
            onRetry: (exception, timeSpan, retryCount, context) =>
            {
                var logger = context.GetLogger();
                logger?.LogWarning(exception,
                    "Retry {RetryCount} for operation {OperationName} after {TimeSpan}s",
                    retryCount, context.OperationKey, timeSpan.TotalSeconds);
            });

    // Circuit breaker policy
    private readonly AsyncCircuitBreakerPolicy _circuitBreakerPolicy = Policy
        .Handle<Exception>()
        .CircuitBreakerAsync(
            exceptionsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30),
            onBreak: (exception, breakDelay, context) =>
            {
                var logger = context.GetLogger();
                logger?.LogError(exception,
                    "Circuit breaker opened for operation {OperationName}. Breaking for {BreakDelay}s",
                    context.OperationKey, breakDelay.TotalSeconds);
            },
            onReset: context =>
            {
                var logger = context.GetLogger();
                logger?.LogInformation("Circuit breaker reset for operation {OperationName}",
                    context.OperationKey);
            },
            onHalfOpen: () =>
            {
                // Optional: Log when circuit breaker is half-open
            });

    public ResilienceService(ILogger<ResilienceService> logger)
    {
        _logger = logger;
    }

    public async Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> operation, string operationName)
    {
        var policy = Policy.WrapAsync(_retryPolicy);

        return await policy.ExecuteAsync(async (context) =>
        {
            context.AddLogger(_logger);
            return await operation();
        }, new Context(operationName));
    }

    public async Task ExecuteWithRetryAsync(Func<Task> operation, string operationName)
    {
        var policy = Policy.WrapAsync(_retryPolicy);

        await policy.ExecuteAsync(async (context) =>
        {
            context.AddLogger(_logger);
            await operation();
        }, new Context(operationName));
    }

    public async Task<T> ExecuteWithCircuitBreakerAsync<T>(Func<Task<T>> operation, string operationName)
    {
        var policy = Policy.WrapAsync(_circuitBreakerPolicy);

        return await policy.ExecuteAsync(async (context) =>
        {
            context.AddLogger(_logger);
            return await operation();
        }, new Context(operationName));
    }

    public async Task ExecuteWithCircuitBreakerAsync(Func<Task> operation, string operationName)
    {
        var policy = Policy.WrapAsync(_circuitBreakerPolicy);

        await policy.ExecuteAsync(async (context) =>
        {
            context.AddLogger(_logger);
            await operation();
        }, new Context(operationName));
    }

    public async Task<T> ExecuteWithTimeoutAsync<T>(Func<Task<T>> operation, TimeSpan timeout, string operationName)
    {
        var timeoutPolicy = Policy.TimeoutAsync<T>(timeout, TimeoutStrategy.Pessimistic,
            onTimeoutAsync: async (context, timespan, task, exception) =>
            {
                _logger.LogError(exception,
                    "Operation {OperationName} timed out after {Timeout}s",
                    context.OperationKey, timespan.TotalSeconds);
            });

        return await timeoutPolicy.ExecuteAsync(async (context) =>
        {
            return await operation();
        }, new Context(operationName));
    }

    public async Task ExecuteWithTimeoutAsync(Func<Task> operation, TimeSpan timeout, string operationName)
    {
        var timeoutPolicy = Policy.TimeoutAsync(timeout, TimeoutStrategy.Pessimistic,
            onTimeoutAsync: async (context, timespan, task, exception) =>
            {
                _logger.LogError(exception,
                    "Operation {OperationName} timed out after {Timeout}s",
                    context.OperationKey, timespan.TotalSeconds);
            });

        await timeoutPolicy.ExecuteAsync(async (context) =>
        {
            await operation();
        }, new Context(operationName));
    }

    /// <summary>
    /// Determines if an exception is transient and should be retried
    /// </summary>
    private static bool IsTransientException(Exception ex)
    {
        // Don't retry certain types of exceptions
        return ex is not (
            ArgumentException or
            InvalidOperationException or
            NotSupportedException or
            UnauthorizedAccessException or
            OperationCanceledException);
    }
}

/// <summary>
/// Extension methods for Polly Context
/// </summary>
public static class PollyContextExtensions
{
    private const string LoggerKey = "Logger";

    public static void AddLogger(this Context context, ILogger logger)
    {
        context[LoggerKey] = logger;
    }

    public static ILogger? GetLogger(this Context context)
    {
        return context.TryGetValue(LoggerKey, out var logger) ? logger as ILogger : null;
    }
}

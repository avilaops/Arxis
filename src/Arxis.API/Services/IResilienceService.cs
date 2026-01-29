namespace Arxis.API.Services;

/// <summary>
/// Interface for resilience patterns service
/// </summary>
public interface IResilienceService
{
    Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> operation, string operationName);
    Task ExecuteWithRetryAsync(Func<Task> operation, string operationName);
    Task<T> ExecuteWithCircuitBreakerAsync<T>(Func<Task<T>> operation, string operationName);
    Task ExecuteWithCircuitBreakerAsync(Func<Task> operation, string operationName);
    Task<T> ExecuteWithTimeoutAsync<T>(Func<Task<T>> operation, TimeSpan timeout, string operationName);
    Task ExecuteWithTimeoutAsync(Func<Task> operation, TimeSpan timeout, string operationName);
}

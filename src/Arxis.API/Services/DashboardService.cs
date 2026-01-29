using System.Text.Json;

namespace Arxis.API.Services;

public interface IDashboardService
{
    Task<DashboardMetrics> GetMetricsAsync(int days = 7);
    Task<List<RecentEvent>> GetRecentEventsAsync(int count = 50);
    Task<List<ConversionFunnelStep>> GetConversionFunnelAsync();
    Task<List<PlanInterestData>> GetPlanInterestDataAsync(int days = 30);
    Task<List<RevenueData>> GetRevenueDataAsync(int days = 30);
}

public class DashboardService : IDashboardService
{
    private readonly ILogger<DashboardService> _logger;
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cache;

    public DashboardService(
        ILogger<DashboardService> logger,
        IConfiguration configuration,
        ICacheService cache)
    {
        _logger = logger;
        _configuration = configuration;
        _cache = cache;
    }

    public async Task<DashboardMetrics> GetMetricsAsync(int days = 7)
    {
        var cacheKey = $"dashboard_metrics_{days}";
        
        // Try to get from cache
        var cachedMetrics = await _cache.GetAsync<DashboardMetrics>(cacheKey);
        if (cachedMetrics != null)
        {
            _logger.LogDebug("Returning cached dashboard metrics for {Days} days", days);
            return cachedMetrics;
        }

        _logger.LogDebug("Generating fresh dashboard metrics for {Days} days", days);
        
        // Por enquanto, retorna dados mockados
        // Em produção, consulte sua plataforma de observabilidade ou
        // utilize um banco de dados para armazenar eventos reais

        var metrics = new DashboardMetrics
        {
            Period = $"Últimos {days} dias",
            TotalUsers = GetRandomMetric(100, 500),
            ActiveUsers = GetRandomMetric(50, 200),
            TotalRevenue = GetRandomMetric(1000, 5000),

            // Funil de conversão
            PageViews = GetRandomMetric(1000, 5000),
            PlanInterests = GetRandomMetric(200, 800),
            CheckoutStarts = GetRandomMetric(50, 200),
            Purchases = GetRandomMetric(10, 50),

            // Taxas
            InterestRate = 0, // Será calculado
            ConversionRate = 0, // Será calculado
            AbandonRate = 0, // Será calculado

            // Features mais usadas
            TopFeatures = new List<FeatureUsage>
            {
                new() { Name = "Criar Projeto", Count = GetRandomMetric(100, 300) },
                new() { Name = "Criar Issue", Count = GetRandomMetric(80, 250) },
                new() { Name = "Upload Documento", Count = GetRandomMetric(50, 150) },
                new() { Name = "Adicionar Tarefa", Count = GetRandomMetric(120, 350) }
            },

            // Emails
            EmailsSent = GetRandomMetric(200, 800),
            EmailsOpened = GetRandomMetric(100, 400),
            EmailsClicked = GetRandomMetric(50, 200),

            // Planos
            PlanBreakdown = new List<PlanStats>
            {
                new() { PlanName = "Starter", Interests = GetRandomMetric(50, 150), Purchases = GetRandomMetric(5, 20) },
                new() { PlanName = "Professional", Interests = GetRandomMetric(80, 200), Purchases = GetRandomMetric(10, 30) },
                new() { PlanName = "Enterprise", Interests = GetRandomMetric(30, 100), Purchases = GetRandomMetric(3, 15) }
            }
        };

        // Calcular taxas
        metrics.InterestRate = metrics.PageViews > 0
            ? Math.Round((metrics.PlanInterests * 100.0) / metrics.PageViews, 2)
            : 0;

        metrics.ConversionRate = metrics.PlanInterests > 0
            ? Math.Round((metrics.Purchases * 100.0) / metrics.PlanInterests, 2)
            : 0;

        metrics.AbandonRate = metrics.CheckoutStarts > 0
            ? Math.Round(((metrics.CheckoutStarts - metrics.Purchases) * 100.0) / metrics.CheckoutStarts, 2)
            : 0;

        return await Task.FromResult(metrics);
    }

    public async Task<List<RecentEvent>> GetRecentEventsAsync(int count = 50)
    {
        // Dados mockados - em produção, buscar do banco ou da sua solução de analytics
        var events = new List<RecentEvent>();
        var random = new Random();
        var eventTypes = new[] { "PlanInterest", "CheckoutStarted", "Purchase", "FeatureUsed", "EmailSent" };
        var users = new[] { "user_001", "user_002", "user_003", "user_004", "user_005" };
        var plans = new[] { "Starter", "Professional", "Enterprise" };

        for (int i = 0; i < count; i++)
        {
            var eventType = eventTypes[random.Next(eventTypes.Length)];
            var timestamp = DateTime.UtcNow.AddMinutes(-random.Next(0, 10080)); // Últimos 7 dias

            events.Add(new RecentEvent
            {
                EventType = eventType,
                UserId = users[random.Next(users.Length)],
                Timestamp = timestamp,
                Details = eventType switch
                {
                    "PlanInterest" => $"Interessado em {plans[random.Next(plans.Length)]}",
                    "CheckoutStarted" => $"Checkout iniciado: {plans[random.Next(plans.Length)]}",
                    "Purchase" => $"💰 Comprou {plans[random.Next(plans.Length)]} - ${random.Next(19, 199)}",
                    "FeatureUsed" => "Usou feature: Criar Projeto",
                    "EmailSent" => "Email enviado: welcome",
                    _ => "Evento genérico"
                }
            });
        }

        return await Task.FromResult(events.OrderByDescending(e => e.Timestamp).ToList());
    }

    public async Task<List<ConversionFunnelStep>> GetConversionFunnelAsync()
    {
        var funnel = new List<ConversionFunnelStep>
        {
            new() { StepName = "Visitou Pricing", Count = 1000, Percentage = 100 },
            new() { StepName = "Clicou em Plano", Count = 350, Percentage = 35 },
            new() { StepName = "Iniciou Checkout", Count = 120, Percentage = 12 },
            new() { StepName = "Completou Compra", Count = 42, Percentage = 4.2 }
        };

        return await Task.FromResult(funnel);
    }

    public async Task<List<PlanInterestData>> GetPlanInterestDataAsync(int days = 30)
    {
        var data = new List<PlanInterestData>();
        var random = new Random();
        var startDate = DateTime.UtcNow.AddDays(-days);

        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            data.Add(new PlanInterestData
            {
                Date = date,
                Starter = random.Next(5, 30),
                Professional = random.Next(10, 40),
                Enterprise = random.Next(3, 15)
            });
        }

        return await Task.FromResult(data);
    }

    public async Task<List<RevenueData>> GetRevenueDataAsync(int days = 30)
    {
        var data = new List<RevenueData>();
        var random = new Random();
        var startDate = DateTime.UtcNow.AddDays(-days);

        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            data.Add(new RevenueData
            {
                Date = date,
                Revenue = random.Next(0, 500) + (random.NextDouble() * 100),
                Purchases = random.Next(0, 10)
            });
        }

        return await Task.FromResult(data);
    }

    private int GetRandomMetric(int min, int max)
    {
        return new Random().Next(min, max);
    }
}

#region Models

public class DashboardMetrics
{
    public string Period { get; set; } = string.Empty;

    // Usuários
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }

    // Revenue
    public decimal TotalRevenue { get; set; }

    // Funil de conversão
    public int PageViews { get; set; }
    public int PlanInterests { get; set; }
    public int CheckoutStarts { get; set; }
    public int Purchases { get; set; }

    // Taxas
    public double InterestRate { get; set; }
    public double ConversionRate { get; set; }
    public double AbandonRate { get; set; }

    // Features
    public List<FeatureUsage> TopFeatures { get; set; } = new();

    // Emails
    public int EmailsSent { get; set; }
    public int EmailsOpened { get; set; }
    public int EmailsClicked { get; set; }

    // Planos
    public List<PlanStats> PlanBreakdown { get; set; } = new();
}

public class FeatureUsage
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class PlanStats
{
    public string PlanName { get; set; } = string.Empty;
    public int Interests { get; set; }
    public int Purchases { get; set; }
    public double ConversionRate => Interests > 0 ? Math.Round((Purchases * 100.0) / Interests, 2) : 0;
}

public class RecentEvent
{
    public string EventType { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Details { get; set; } = string.Empty;
}

public class ConversionFunnelStep
{
    public string StepName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class PlanInterestData
{
    public DateTime Date { get; set; }
    public int Starter { get; set; }
    public int Professional { get; set; }
    public int Enterprise { get; set; }
}

public class RevenueData
{
    public DateTime Date { get; set; }
    public double Revenue { get; set; }
    public int Purchases { get; set; }
}

#endregion

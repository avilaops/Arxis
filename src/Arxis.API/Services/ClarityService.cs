using System.Net.Http.Headers;
using System.Text.Json;

namespace Arxis.API.Services;

public interface IClarityService
{
    Task<ClarityMetrics> GetProjectMetricsAsync(string projectId, int days = 7);
    Task<List<ClaritySession>> GetRecentSessionsAsync(string projectId, int limit = 20);
}

public class ClarityService : IClarityService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ClarityService> _logger;

    public ClarityService(HttpClient httpClient, IConfiguration configuration, ILogger<ClarityService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ClarityMetrics> GetProjectMetricsAsync(string projectId, int days = 7)
    {
        try
        {
            var token = _configuration["Clarity:ApiToken"];
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("Clarity API token not configured");
                return GetMockMetrics();
            }

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var startDate = DateTime.UtcNow.AddDays(-days).ToString("yyyy-MM-dd");
            var endDate = DateTime.UtcNow.ToString("yyyy-MM-dd");

            // Clarity API endpoint
            var url = $"https://www.clarity.ms/api/v1/projects/{projectId}/insights?start={startDate}&end={endDate}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch Clarity data: {StatusCode}", response.StatusCode);
                return GetMockMetrics();
            }

            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<ClarityApiResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return new ClarityMetrics
            {
                TotalSessions = data?.TotalSessions ?? 0,
                TotalUsers = data?.TotalUsers ?? 0,
                PageViews = data?.PageViews ?? 0,
                AverageSessionDuration = data?.AverageSessionDuration ?? 0,
                BounceRate = data?.BounceRate ?? 0,
                TopPages = data?.TopPages ?? new List<PageMetric>(),
                DeviceBreakdown = data?.DeviceBreakdown ?? new DeviceStats(),
                RageClicks = data?.RageClicks ?? 0,
                DeadClicks = data?.DeadClicks ?? 0,
                JavaScriptErrors = data?.JavaScriptErrors ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Clarity metrics");
            return GetMockMetrics();
        }
    }

    public async Task<List<ClaritySession>> GetRecentSessionsAsync(string projectId, int limit = 20)
    {
        try
        {
            var token = _configuration["Clarity:ApiToken"];
            if (string.IsNullOrEmpty(token))
            {
                return GetMockSessions();
            }

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var url = $"https://www.clarity.ms/api/v1/projects/{projectId}/sessions?limit={limit}";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch Clarity sessions");
                return GetMockSessions();
            }

            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<ClaritySessionsResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return data?.Sessions ?? GetMockSessions();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Clarity sessions");
            return GetMockSessions();
        }
    }

    private ClarityMetrics GetMockMetrics()
    {
        return new ClarityMetrics
        {
            TotalSessions = 1250,
            TotalUsers = 850,
            PageViews = 5430,
            AverageSessionDuration = 185.5,
            BounceRate = 42.3,
            TopPages = new List<PageMetric>
            {
                new() { Page = "/pricing", Views = 1250 },
                new() { Page = "/dashboard", Views = 980 },
                new() { Page = "/projects", Views = 750 }
            },
            DeviceBreakdown = new DeviceStats
            {
                Desktop = 65.2,
                Mobile = 28.5,
                Tablet = 6.3
            },
            RageClicks = 23,
            DeadClicks = 45,
            JavaScriptErrors = 12
        };
    }

    private List<ClaritySession> GetMockSessions()
    {
        var sessions = new List<ClaritySession>();
        var random = new Random();
        var pages = new[] { "/pricing", "/dashboard", "/projects", "/checkout", "/admin" };

        for (int i = 0; i < 20; i++)
        {
            sessions.Add(new ClaritySession
            {
                SessionId = Guid.NewGuid().ToString("N")[..12],
                StartTime = DateTime.UtcNow.AddMinutes(-random.Next(0, 10080)),
                Duration = random.Next(30, 600),
                PageCount = random.Next(1, 15),
                Device = random.Next(0, 100) > 70 ? "Desktop" : "Mobile",
                Location = "Brazil",
                HasRageClicks = random.Next(0, 100) > 90,
                HasDeadClicks = random.Next(0, 100) > 85,
                TopPage = pages[random.Next(pages.Length)],
                RecordingUrl = $"https://clarity.microsoft.com/projects/view/xxxxx/sessions/{Guid.NewGuid():N}"
            });
        }

        return sessions.OrderByDescending(s => s.StartTime).ToList();
    }
}

#region Models

public class ClarityMetrics
{
    public int TotalSessions { get; set; }
    public int TotalUsers { get; set; }
    public int PageViews { get; set; }
    public double AverageSessionDuration { get; set; }
    public double BounceRate { get; set; }
    public List<PageMetric> TopPages { get; set; } = new();
    public DeviceStats DeviceBreakdown { get; set; } = new();
    public int RageClicks { get; set; }
    public int DeadClicks { get; set; }
    public int JavaScriptErrors { get; set; }
}

public class PageMetric
{
    public string Page { get; set; } = string.Empty;
    public int Views { get; set; }
}

public class DeviceStats
{
    public double Desktop { get; set; }
    public double Mobile { get; set; }
    public double Tablet { get; set; }
}

public class ClaritySession
{
    public string SessionId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public int Duration { get; set; }
    public int PageCount { get; set; }
    public string Device { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool HasRageClicks { get; set; }
    public bool HasDeadClicks { get; set; }
    public string TopPage { get; set; } = string.Empty;
    public string RecordingUrl { get; set; } = string.Empty;
}

// API Response Models
public class ClarityApiResponse
{
    public int TotalSessions { get; set; }
    public int TotalUsers { get; set; }
    public int PageViews { get; set; }
    public double AverageSessionDuration { get; set; }
    public double BounceRate { get; set; }
    public List<PageMetric> TopPages { get; set; } = new();
    public DeviceStats DeviceBreakdown { get; set; } = new();
    public int RageClicks { get; set; }
    public int DeadClicks { get; set; }
    public int JavaScriptErrors { get; set; }
}

public class ClaritySessionsResponse
{
    public List<ClaritySession> Sessions { get; set; } = new();
}

#endregion

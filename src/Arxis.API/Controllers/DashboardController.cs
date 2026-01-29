using Arxis.API.Models;
using Arxis.API.Services;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly ILogger<DashboardController> _logger;
    private readonly IDashboardService? _dashboardService;
    private readonly IClarityService? _clarityService;

    public DashboardController(
        ArxisDbContext context,
        ILogger<DashboardController> logger,
        IDashboardService? dashboardService = null,
        IClarityService? clarityService = null)
    {
        _context = context;
        _logger = logger;
        _dashboardService = dashboardService;
        _clarityService = clarityService;
    }

    /// <summary>
    /// Get complete dashboard overview with all KPIs
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverview>> GetOverview()
    {
        try
        {
            var overview = new DashboardOverview
            {
                ProjectStats = await GetProjectStatistics(),
                TaskStats = await GetTaskStatistics(),
                IssueStats = await GetIssueStatistics(),
                BudgetStats = await GetBudgetStatistics(),
                RecentProjects = await GetRecentProjects(10),
                Timeline = await GetTimelineEvents(20)
            };

            return Ok(overview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard overview");
            return StatusCode(500, "Error loading dashboard data");
        }
    }

    /// <summary>
    /// Get project statistics
    /// </summary>
    [HttpGet("statistics/projects")]
    public async Task<ActionResult<ProjectStatistics>> GetProjectStats()
    {
        var stats = await GetProjectStatistics();
        return Ok(stats);
    }

    /// <summary>
    /// Get task statistics
    /// </summary>
    [HttpGet("statistics/tasks")]
    public async Task<ActionResult<TaskStatistics>> GetTaskStats()
    {
        var stats = await GetTaskStatistics();
        return Ok(stats);
    }

    /// <summary>
    /// Get issue statistics
    /// </summary>
    [HttpGet("statistics/issues")]
    public async Task<ActionResult<IssueStatistics>> GetIssueStats()
    {
        var stats = await GetIssueStatistics();
        return Ok(stats);
    }

    /// <summary>
    /// Get budget statistics
    /// </summary>
    [HttpGet("statistics/budget")]
    public async Task<ActionResult<BudgetStatistics>> GetBudgetStats()
    {
        var stats = await GetBudgetStatistics();
        return Ok(stats);
    }

    /// <summary>
    /// Get recent projects with progress
    /// </summary>
    [HttpGet("projects/recent")]
    public async Task<ActionResult<List<ProjectProgress>>> GetRecentProjectsList([FromQuery] int limit = 10)
    {
        var projects = await GetRecentProjects(limit);
        return Ok(projects);
    }

    /// <summary>
    /// Get timeline of recent activities
    /// </summary>
    [HttpGet("timeline")]
    public async Task<ActionResult<List<TimelineEvent>>> GetTimeline([FromQuery] int limit = 20)
    {
        var timeline = await GetTimelineEvents(limit);
        return Ok(timeline);
    }

    #region Private Methods

    private async Task<ProjectStatistics> GetProjectStatistics()
    {
        var projects = await _context.Projects.ToListAsync();

        var stats = new ProjectStatistics
        {
            TotalProjects = projects.Count,
            ActiveProjects = projects.Count(p => p.Status == ProjectStatus.InProgress),
            CompletedProjects = projects.Count(p => p.Status == ProjectStatus.Completed),
            OnHoldProjects = projects.Count(p => p.Status == ProjectStatus.OnHold),
            ProjectsByStatus = projects
                .GroupBy(p => p.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            ProjectsByType = projects
                .GroupBy(p => p.Type.ToString())
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    private async Task<TaskStatistics> GetTaskStatistics()
    {
        var tasks = await _context.WorkTasks.ToListAsync();
        var now = DateTime.UtcNow;

        var completedTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.Done);
        var totalTasks = tasks.Count;

        var stats = new TaskStatistics
        {
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            InProgressTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.InProgress),
            OverdueTasks = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < now && t.Status != Domain.Entities.TaskStatus.Done),
            CompletionRate = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0,
            TasksByStatus = tasks
                .GroupBy(t => t.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            TasksByPriority = tasks
                .GroupBy(t => t.Priority.ToString())
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    private async Task<IssueStatistics> GetIssueStatistics()
    {
        var issues = await _context.Issues.ToListAsync();

        var totalIssues = issues.Count;
        var resolvedIssues = issues.Count(i => i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed);

        var stats = new IssueStatistics
        {
            TotalIssues = totalIssues,
            OpenIssues = issues.Count(i => i.Status == IssueStatus.Open || i.Status == IssueStatus.InAnalysis),
            ResolvedIssues = resolvedIssues,
            CriticalIssues = issues.Count(i => i.Priority == IssuePriority.P1_Critical),
            ResolutionRate = totalIssues > 0 ? Math.Round((double)resolvedIssues / totalIssues * 100, 2) : 0,
            IssuesByStatus = issues
                .GroupBy(i => i.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            IssuesBySeverity = issues
                .GroupBy(i => i.Priority.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            IssuesByType = issues
                .GroupBy(i => i.Type.ToString())
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    private async Task<BudgetStatistics> GetBudgetStatistics()
    {
        var projects = await _context.Projects.Where(p => p.TotalBudget.HasValue).ToListAsync();

        var totalBudget = projects.Sum(p => p.TotalBudget ?? 0);
        // For now, spent is 0 since we don't have expense tracking yet
        var totalSpent = 0m;

        var stats = new BudgetStatistics
        {
            TotalBudget = totalBudget,
            TotalSpent = totalSpent,
            Remaining = totalBudget - totalSpent,
            SpentPercentage = totalBudget > 0 ? Math.Round((double)(totalSpent / totalBudget) * 100, 2) : 0,
            ProjectsOverBudget = 0, // Will be calculated when expense tracking is implemented
            ProjectsUnderBudget = projects.Count
        };

        return stats;
    }

    private async Task<List<ProjectProgress>> GetRecentProjects(int limit)
    {
        var projects = await _context.Projects
            .OrderByDescending(p => p.UpdatedAt)
            .Take(limit)
            .ToListAsync();

        var projectProgress = new List<ProjectProgress>();

        foreach (var project in projects)
        {
            var tasks = await _context.WorkTasks.Where(t => t.ProjectId == project.Id).ToListAsync();
            var issues = await _context.Issues.Where(i => i.ProjectId == project.Id).ToListAsync();

            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.Done);
            var openIssues = issues.Count(i => i.Status != IssueStatus.Closed && i.Status != IssueStatus.Resolved);

            var progress = new ProjectProgress
            {
                ProjectId = project.Id,
                ProjectName = project.Name,
                Status = project.Status.ToString(),
                CompletionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                OpenIssues = openIssues,
                Budget = project.TotalBudget,
                Spent = 0, // Will be calculated when expense tracking is implemented
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                IsOverdue = project.EndDate.HasValue && project.EndDate.Value < DateTime.UtcNow && project.Status != ProjectStatus.Completed
            };

            projectProgress.Add(progress);
        }

        return projectProgress;
    }

    private async Task<List<TimelineEvent>> GetTimelineEvents(int limit)
    {
        var timeline = new List<TimelineEvent>();

        // Get recent projects
        var recentProjects = await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit / 3)
            .Select(p => new TimelineEvent
            {
                Id = p.Id,
                Type = "project",
                Action = "created",
                Title = p.Name,
                Description = $"Project created: {p.Name}",
                ProjectId = p.Id,
                ProjectName = p.Name,
                Timestamp = p.CreatedAt
            })
            .ToListAsync();

        // Get recent tasks
        var recentTasks = await _context.WorkTasks
            .Include(t => t.Project)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit / 3)
            .Select(t => new TimelineEvent
            {
                Id = t.Id,
                Type = "task",
                Action = t.Status == Domain.Entities.TaskStatus.Done ? "completed" : "created",
                Title = t.Title,
                Description = $"Task {(t.Status == Domain.Entities.TaskStatus.Done ? "completed" : "created")}: {t.Title}",
                ProjectId = t.ProjectId,
                ProjectName = t.Project.Name,
                Timestamp = t.Status == Domain.Entities.TaskStatus.Done ? (t.UpdatedAt ?? t.CreatedAt) : t.CreatedAt
            })
            .ToListAsync();

        // Get recent issues
        var recentIssues = await _context.Issues
            .Include(i => i.Project)
            .OrderByDescending(i => i.CreatedAt)
            .Take(limit / 3)
            .Select(i => new TimelineEvent
            {
                Id = i.Id,
                Type = "issue",
                Action = i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed ? "resolved" : "created",
                Title = i.Title,
                Description = $"Issue {(i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed ? "resolved" : "created")}: {i.Title}",
                ProjectId = i.ProjectId,
                ProjectName = i.Project.Name,
                Timestamp = i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed ? (i.UpdatedAt ?? i.CreatedAt) : i.CreatedAt
            })
            .ToListAsync();

        timeline.AddRange(recentProjects);
        timeline.AddRange(recentTasks);
        timeline.AddRange(recentIssues);

        return timeline.OrderByDescending(e => e.Timestamp).Take(limit).ToList();
    }

    #endregion

    #region Analytics & Business Metrics

    /// <summary>
    /// Get analytics metrics (sales, conversions, etc)
    /// </summary>
    [HttpGet("analytics/metrics")]
    public async Task<IActionResult> GetAnalyticsMetrics([FromQuery] int days = 7)
    {
        if (_dashboardService == null)
        {
            return Ok(new { message = "Analytics service not configured" });
        }

        var metrics = await _dashboardService.GetMetricsAsync(days);
        return Ok(metrics);
    }

    /// <summary>
    /// Get recent events (real-time activity feed)
    /// </summary>
    [HttpGet("analytics/recent-events")]
    public async Task<IActionResult> GetRecentAnalyticsEvents([FromQuery] int count = 50)
    {
        if (_dashboardService == null)
        {
            return Ok(new List<object>());
        }

        var events = await _dashboardService.GetRecentEventsAsync(count);
        return Ok(events);
    }

    /// <summary>
    /// Get conversion funnel data
    /// </summary>
    [HttpGet("analytics/conversion-funnel")]
    public async Task<IActionResult> GetConversionFunnel()
    {
        if (_dashboardService == null)
        {
            return Ok(new List<object>());
        }

        var funnel = await _dashboardService.GetConversionFunnelAsync();
        return Ok(funnel);
    }

    /// <summary>
    /// Get plan interest data over time
    /// </summary>
    [HttpGet("analytics/plan-interest")]
    public async Task<IActionResult> GetPlanInterestData([FromQuery] int days = 30)
    {
        if (_dashboardService == null)
        {
            return Ok(new List<object>());
        }

        var data = await _dashboardService.GetPlanInterestDataAsync(days);
        return Ok(data);
    }

    /// <summary>
    /// Get revenue data over time
    /// </summary>
    [HttpGet("analytics/revenue")]
    public async Task<IActionResult> GetRevenueData([FromQuery] int days = 30)
    {
        if (_dashboardService == null)
        {
            return Ok(new List<object>());
        }

        var data = await _dashboardService.GetRevenueDataAsync(days);
        return Ok(data);
    }

    /// <summary>
    /// Get Clarity metrics (sessions, users, behavior)
    /// </summary>
    [HttpGet("clarity/metrics")]
    public async Task<IActionResult> GetClarityMetrics([FromQuery] string projectId, [FromQuery] int days = 7)
    {
        if (_clarityService == null)
        {
            return Ok(new { message = "Clarity service not configured" });
        }

        var metrics = await _clarityService.GetProjectMetricsAsync(projectId, days);
        return Ok(metrics);
    }

    /// <summary>
    /// Get recent Clarity sessions with recordings
    /// </summary>
    [HttpGet("clarity/sessions")]
    public async Task<IActionResult> GetClaritySessions([FromQuery] string projectId, [FromQuery] int limit = 20)
    {
        if (_clarityService == null)
        {
            return Ok(new List<object>());
        }

        var sessions = await _clarityService.GetRecentSessionsAsync(projectId, limit);
        return Ok(sessions);
    }

    #endregion
}

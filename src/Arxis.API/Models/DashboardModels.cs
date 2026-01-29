namespace Arxis.API.Models;

/// <summary>
/// Dashboard overview with all KPIs
/// </summary>
public class DashboardOverview
{
    public ProjectStatistics ProjectStats { get; set; } = new();
    public TaskStatistics TaskStats { get; set; } = new();
    public IssueStatistics IssueStats { get; set; } = new();
    public BudgetStatistics BudgetStats { get; set; } = new();
    public List<ProjectProgress> RecentProjects { get; set; } = new();
    public List<TimelineEvent> Timeline { get; set; } = new();
}

/// <summary>
/// Project statistics and KPIs
/// </summary>
public class ProjectStatistics
{
    public int TotalProjects { get; set; }
    public int ActiveProjects { get; set; }
    public int CompletedProjects { get; set; }
    public int OnHoldProjects { get; set; }
    public Dictionary<string, int> ProjectsByStatus { get; set; } = new();
    public Dictionary<string, int> ProjectsByType { get; set; } = new();
}

/// <summary>
/// Task statistics and completion metrics
/// </summary>
public class TaskStatistics
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int OverdueTasks { get; set; }
    public double CompletionRate { get; set; }
    public Dictionary<string, int> TasksByStatus { get; set; } = new();
    public Dictionary<string, int> TasksByPriority { get; set; } = new();
}

/// <summary>
/// Issue statistics and tracking
/// </summary>
public class IssueStatistics
{
    public int TotalIssues { get; set; }
    public int OpenIssues { get; set; }
    public int ResolvedIssues { get; set; }
    public int CriticalIssues { get; set; }
    public double ResolutionRate { get; set; }
    public Dictionary<string, int> IssuesByStatus { get; set; } = new();
    public Dictionary<string, int> IssuesBySeverity { get; set; } = new();
    public Dictionary<string, int> IssuesByType { get; set; } = new();
}

/// <summary>
/// Budget and financial statistics
/// </summary>
public class BudgetStatistics
{
    public decimal TotalBudget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal Remaining { get; set; }
    public double SpentPercentage { get; set; }
    public int ProjectsOverBudget { get; set; }
    public int ProjectsUnderBudget { get; set; }
}

/// <summary>
/// Individual project progress information
/// </summary>
public class ProjectProgress
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OpenIssues { get; set; }
    public decimal? Budget { get; set; }
    public decimal? Spent { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// Timeline event for activity feed
/// </summary>
public class TimelineEvent
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty; // "project", "task", "issue"
    public string Action { get; set; } = string.Empty; // "created", "updated", "completed"
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public DateTime Timestamp { get; set; }
    public string? UserName { get; set; }
}

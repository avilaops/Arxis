namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents a task in the system (from Tasks & Workflow module)
/// </summary>
public class WorkTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Squad { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public string? AssigneeName { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }
    public Guid? ParentTaskId { get; set; }
    public WorkTask? ParentTask { get; set; }
    public ICollection<WorkTask> SubTasks { get; set; } = new List<WorkTask>();
    public List<string> Tags { get; set; } = new();
    public List<TaskChecklistItem> Checklist { get; set; } = new();
}

public class TaskChecklistItem
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public enum TaskStatus
{
    Backlog,
    Todo,
    InProgress,
    Blocked,
    Review,
    Done,
    Cancelled
}

public enum TaskPriority
{
    P4_Low,
    P3_Medium,
    P2_High,
    P1_Critical
}

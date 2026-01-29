namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents an issue or RFI (Request for Information)
/// </summary>
public class Issue : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IssueType Type { get; set; }
    public IssuePriority Priority { get; set; }
    public IssueStatus Status { get; set; }
    public string ReferenceCode { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int? SlaMinutes { get; set; }
    public DateTime? ResponseDueDate { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }
    public Guid? ReportedByUserId { get; set; }
    public User? ReportedByUser { get; set; }
    public Guid? RespondedByUserId { get; set; }
    public User? RespondedByUser { get; set; }
    public bool IsRFI { get; set; }
    public bool IsBlocking { get; set; }
    public Guid? WorkTaskId { get; set; }
    public WorkTask? WorkTask { get; set; }
    public string? Location { get; set; }
    public string? Discipline { get; set; }
    public string? Resolution { get; set; }
    public string? RfiQuestion { get; set; }
    public string? RfiAnswer { get; set; }
    public string? ExternalReference { get; set; }
    public ICollection<IssueComment> Comments { get; set; } = new List<IssueComment>();
    public ICollection<IssueAttachment> Attachments { get; set; } = new List<IssueAttachment>();
    public ICollection<IssueLink> Links { get; set; } = new List<IssueLink>();
}

public enum IssueType
{
    Design,
    Execution,
    Safety,
    Quality,
    Supply,
    Contract,
    Other
}

public enum IssuePriority
{
    P4_Low,
    P3_Medium,
    P2_High,
    P1_Critical
}

public enum IssueStatus
{
    Open,
    InAnalysis,
    AwaitingResponse,
    Resolved,
    Closed,
    Cancelled
}

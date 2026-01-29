namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents a construction project in the system
/// </summary>
public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Client { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string Currency { get; set; } = "BRL";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ContractDate { get; set; }
    public decimal? TotalBudget { get; set; }
    public ProjectStatus Status { get; set; }
    public ProjectType Type { get; set; }
    public List<string> Tags { get; set; } = new();
    
    // Navigation properties
    public Guid? TenantId { get; set; }
    public ICollection<ProjectUser> ProjectUsers { get; set; } = new List<ProjectUser>();
}

public enum ProjectStatus
{
    Planning,
    InProgress,
    OnHold,
    Completed,
    Archived,
    Cancelled
}

public enum ProjectType
{
    Residential,
    Commercial,
    Industrial,
    Infrastructure,
    Hospital,
    Educational,
    Other
}

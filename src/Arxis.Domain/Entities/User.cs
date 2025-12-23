namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents a user in the system
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string? Language { get; set; } = "pt-BR";
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    
    // Authentication fields
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Admin, Manager, User, Viewer
    
    // Navigation properties
    public Guid? TenantId { get; set; }
    public ICollection<ProjectUser> ProjectUsers { get; set; } = new List<ProjectUser>();
}

/// <summary>
/// Many-to-many relationship between Users and Projects
/// </summary>
public class ProjectUser : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public ProjectRole Role { get; set; }
}

public enum ProjectRole
{
    Owner,
    Manager,
    Engineer,
    Architect,
    Contractor,
    Supervisor,
    Inspector,
    Client,
    Viewer
}

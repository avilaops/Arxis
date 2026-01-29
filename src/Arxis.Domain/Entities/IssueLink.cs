namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents a contextual link between an issue and another entity or external reference.
/// </summary>
public class IssueLink : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public IssueLinkType LinkType { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? ExternalReference { get; set; }
    public string? Label { get; set; }
    public string? Metadata { get; set; }
}

public enum IssueLinkType
{
    WorkTask,
    ModelElement,
    Document,
    Contract,
    DailyLog,
    Other
}

namespace Arxis.Domain.Entities;

using System.Collections.Generic;
using Arxis.Domain.Common;

/// <summary>
/// Represents a comment in an issue or RFI thread.
/// </summary>
public class IssueComment : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public Guid? AuthorId { get; set; }
    public User? Author { get; set; }
    public ICollection<IssueAttachment> Attachments { get; set; } = new List<IssueAttachment>();
}

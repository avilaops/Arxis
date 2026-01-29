namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents an attachment associated with an issue or comment.
/// </summary>
public class IssueAttachment : BaseEntity
{
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
    public Guid? CommentId { get; set; }
    public IssueComment? Comment { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long FileSize { get; set; }
    public Guid? UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }
}

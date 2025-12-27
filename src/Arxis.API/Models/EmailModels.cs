namespace Arxis.API.Models;

/// <summary>
/// Email message structure
/// Based on avx-cell Email structure
/// </summary>
public class EmailMessage
{
    public string From { get; set; } = string.Empty;
    public List<string> To { get; set; } = new();
    public List<string> Cc { get; set; } = new();
    public List<string> Bcc { get; set; } = new();
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? HtmlBody { get; set; }
    public Dictionary<string, string> Headers { get; set; } = new();
    public List<EmailAttachment> Attachments { get; set; } = new();
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public bool IsHtml { get; set; } = false;
}

/// <summary>
/// Email attachment structure
/// </summary>
public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public byte[] Content { get; set; } = Array.Empty<byte>();
}

/// <summary>
/// Email template structure
/// Based on avx-cell EmailTemplate
/// </summary>
public class EmailTemplate
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? HtmlBody { get; set; }
    public List<string> RequiredVariables { get; set; } = new();
}

/// <summary>
/// Email queue item for batch sending
/// Based on avx-cell QueuedEmail
/// </summary>
public class QueuedEmail
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public EmailMessage Email { get; set; } = new();
    public EmailQueueStatus Status { get; set; } = EmailQueueStatus.Pending;
    public int Attempts { get; set; } = 0;
    public int MaxAttempts { get; set; } = 3;
    public DateTime? ScheduledTime { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
}

/// <summary>
/// Email queue status
/// Based on avx-cell QueueStatus
/// </summary>
public enum EmailQueueStatus
{
    Pending,
    Sending,
    Sent,
    Failed,
    Retry
}

/// <summary>
/// Email statistics
/// </summary>
public class EmailQueueStats
{
    public int Pending { get; set; }
    public int Sent { get; set; }
    public int Failed { get; set; }
}

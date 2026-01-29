namespace Arxis.Domain.Entities;

using Arxis.Domain.Common;

/// <summary>
/// Represents a document/file in the system
/// </summary>
public class Document : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentCategory Category { get; set; }
    public string? FolderPath { get; set; }
    public List<string> Tags { get; set; } = new();

    // Versioning
    public int Version { get; set; } = 1;
    public Guid? ParentDocumentId { get; set; }
    public Document? ParentDocument { get; set; }
    public ICollection<Document> Versions { get; set; } = new List<Document>();

    // Relationships
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid? WorkTaskId { get; set; }
    public WorkTask? WorkTask { get; set; }

    public Guid? IssueId { get; set; }
    public Issue? Issue { get; set; }

    public Guid UploadedByUserId { get; set; }
    public User UploadedByUser { get; set; } = null!;

    // Metadata
    public DateTime? LastAccessedAt { get; set; }
    public int DownloadCount { get; set; }
    public bool IsArchived { get; set; }
    public DateTime? ArchivedAt { get; set; }
}

public enum DocumentCategory
{
    Drawing,        // Plantas, desenhos técnicos
    Specification,  // Especificações técnicas
    Contract,       // Contratos
    Invoice,        // Notas fiscais
    Photo,          // Fotos da obra
    Report,         // Relatórios
    Manual,         // Manuais
    Certificate,    // Certificados
    Permit,         // Licenças e alvarás
    Schedule,       // Cronogramas
    Budget,         // Orçamentos
    Email,          // E-mails
    Other           // Outros
}

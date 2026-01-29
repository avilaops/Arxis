using Arxis.API.Services;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<DocumentsController> _logger;
    private readonly long _maxFileSize = 100 * 1024 * 1024; // 100MB
    private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".dwg", ".jpg", ".jpeg", ".png", ".zip", ".rar", ".txt", ".csv" };

    public DocumentsController(ArxisDbContext context, IFileStorageService fileStorage, ILogger<DocumentsController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    /// <summary>
    /// Get all documents for a project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<List<Document>>> GetProjectDocuments(Guid projectId, [FromQuery] DocumentCategory? category = null)
    {
        var query = _context.Documents
            .Include(d => d.UploadedByUser)
            .Where(d => d.ProjectId == projectId && !d.IsArchived);

        if (category.HasValue)
        {
            query = query.Where(d => d.Category == category.Value);
        }

        var documents = await query
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(documents);
    }

    /// <summary>
    /// Get a specific document
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Document>> GetDocument(Guid id)
    {
        var document = await _context.Documents
            .Include(d => d.UploadedByUser)
            .Include(d => d.Project)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound();
        }

        // Update last accessed
        document.LastAccessedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(document);
    }

    /// <summary>
    /// Upload a new document
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(100_000_000)] // 100MB
    public async Task<ActionResult<Document>> UploadDocument(
        [FromForm] Guid projectId,
        [FromForm] IFormFile file,
        [FromForm] DocumentCategory category,
        [FromForm] string? description = null,
        [FromForm] string? folderPath = null,
        [FromForm] Guid? workTaskId = null,
        [FromForm] Guid? issueId = null)
    {
        try
        {
            // Validate file
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            if (file.Length > _maxFileSize)
            {
                return BadRequest($"File size exceeds maximum allowed size of {_maxFileSize / (1024 * 1024)}MB");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                return BadRequest($"File type '{extension}' is not allowed");
            }

            // Get user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }

            // Verify project exists
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            if (!projectExists)
            {
                return NotFound("Project not found");
            }

            // Save file
            var folder = $"{projectId}/{category}";
            string storagePath;

            using (var stream = file.OpenReadStream())
            {
                storagePath = await _fileStorage.SaveFileAsync(stream, file.FileName, folder);
            }

            // Create document record
            var document = new Document
            {
                FileName = Path.GetFileName(storagePath),
                OriginalFileName = file.FileName,
                FileExtension = extension,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
                StoragePath = storagePath,
                Description = description,
                Category = category,
                FolderPath = folderPath,
                ProjectId = projectId,
                WorkTaskId = workTaskId,
                IssueId = issueId,
                UploadedByUserId = userId,
                Version = 1
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            // Load relationships
            await _context.Entry(document).Reference(d => d.UploadedByUser).LoadAsync();

            _logger.LogInformation("Document {DocumentId} uploaded successfully for project {ProjectId}", document.Id, projectId);

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document");
            return StatusCode(500, "Error uploading file");
        }
    }

    /// <summary>
    /// Download a document
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        try
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
            {
                return NotFound();
            }

            var fileStream = await _fileStorage.GetFileAsync(document.StoragePath);

            // Update download count and last accessed
            document.DownloadCount++;
            document.LastAccessedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return File(fileStream, document.ContentType, document.OriginalFileName);
        }
        catch (FileNotFoundException)
        {
            return NotFound("File not found in storage");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document {DocumentId}", id);
            return StatusCode(500, "Error downloading file");
        }
    }

    /// <summary>
    /// Update document metadata
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] UpdateDocumentRequest request)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
        {
            return NotFound();
        }

        if (request.Description != null)
            document.Description = request.Description;

        if (request.Category.HasValue)
            document.Category = request.Category.Value;

        if (request.FolderPath != null)
            document.FolderPath = request.FolderPath;

        if (request.Tags != null)
            document.Tags = request.Tags;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a document
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id, [FromQuery] bool permanent = false)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
        {
            return NotFound();
        }

        if (permanent)
        {
            // Delete file from storage
            await _fileStorage.DeleteFileAsync(document.StoragePath);

            // Delete from database
            _context.Documents.Remove(document);
            _logger.LogInformation("Document {DocumentId} permanently deleted", id);
        }
        else
        {
            // Soft delete (archive)
            document.IsArchived = true;
            document.ArchivedAt = DateTime.UtcNow;
            _logger.LogInformation("Document {DocumentId} archived", id);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Upload a new version of an existing document
    /// </summary>
    [HttpPost("{id}/version")]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<Document>> UploadNewVersion(Guid id, [FromForm] IFormFile file, [FromForm] string? description = null)
    {
        try
        {
            var parentDocument = await _context.Documents
                .Include(d => d.Versions)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (parentDocument == null)
            {
                return NotFound("Parent document not found");
            }

            // Validate file
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != parentDocument.FileExtension)
            {
                return BadRequest("New version must have the same file type");
            }

            // Get user ID
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            // Save file
            var folder = $"{parentDocument.ProjectId}/{parentDocument.Category}";
            string storagePath;

            using (var stream = file.OpenReadStream())
            {
                storagePath = await _fileStorage.SaveFileAsync(stream, file.FileName, folder);
            }

            // Create new version
            var maxVersion = parentDocument.Versions.Any() ? parentDocument.Versions.Max(v => v.Version) : parentDocument.Version;

            var newVersion = new Document
            {
                FileName = Path.GetFileName(storagePath),
                OriginalFileName = file.FileName,
                FileExtension = extension,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
                StoragePath = storagePath,
                Description = description ?? parentDocument.Description,
                Category = parentDocument.Category,
                FolderPath = parentDocument.FolderPath,
                ProjectId = parentDocument.ProjectId,
                WorkTaskId = parentDocument.WorkTaskId,
                IssueId = parentDocument.IssueId,
                UploadedByUserId = userId,
                ParentDocumentId = parentDocument.Id,
                Version = maxVersion + 1
            };

            _context.Documents.Add(newVersion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocument), new { id = newVersion.Id }, newVersion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading new document version");
            return StatusCode(500, "Error uploading file version");
        }
    }

    /// <summary>
    /// Get all versions of a document
    /// </summary>
    [HttpGet("{id}/versions")]
    public async Task<ActionResult<List<Document>>> GetDocumentVersions(Guid id)
    {
        var document = await _context.Documents
            .Include(d => d.Versions)
                .ThenInclude(v => v.UploadedByUser)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound();
        }

        var allVersions = new List<Document> { document };
        allVersions.AddRange(document.Versions.OrderBy(v => v.Version));

        return Ok(allVersions);
    }
}

public class UpdateDocumentRequest
{
    public string? Description { get; set; }
    public DocumentCategory? Category { get; set; }
    public string? FolderPath { get; set; }
    public List<string>? Tags { get; set; }
}

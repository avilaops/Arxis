using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.API.Models;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IssuesController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly ILogger<IssuesController> _logger;

    public IssuesController(ArxisDbContext context, ILogger<IssuesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all issues for a project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<IssueSummaryDto>>> GetProjectIssues(Guid projectId, [FromQuery] bool? isRfi = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Issue> query = _context.Issues
            .AsNoTracking()
            .Where(i => i.ProjectId == projectId && !i.IsDeleted)
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .Include(i => i.RespondedByUser)
            .Include(i => i.WorkTask);

        if (isRfi.HasValue)
        {
            query = query.Where(i => i.IsRFI == isRfi.Value);
        }

        var issues = await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);

        return issues.Select(MapToSummary).ToList();
    }

    /// <summary>
    /// Get detailed information about an issue or RFI
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<IssueDetailDto>> GetIssue(Guid id, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues
            .AsNoTracking()
            .Where(i => i.Id == id && !i.IsDeleted)
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .Include(i => i.RespondedByUser)
            .Include(i => i.WorkTask)
            .Include(i => i.Attachments).ThenInclude(a => a.UploadedByUser)
            .Include(i => i.Comments).ThenInclude(c => c.Author)
            .Include(i => i.Comments).ThenInclude(c => c.Attachments).ThenInclude(a => a.UploadedByUser)
            .Include(i => i.Links)
            .FirstOrDefaultAsync(cancellationToken);

        if (issue == null)
        {
            return NotFound();
        }

        return MapToDetail(issue);
    }

    /// <summary>
    /// Create a new issue or RFI
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<IssueDetailDto>> CreateIssue([FromBody] IssueCreateRequest request, CancellationToken cancellationToken = default)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.ProjectId && !p.IsDeleted, cancellationToken);
        if (!projectExists)
        {
            return BadRequest($"Projeto {request.ProjectId} não encontrado ou inativo.");
        }

        var issue = new Issue
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            Priority = request.Priority,
            Status = IssueStatus.Open,
            IsRFI = request.IsRfi,
            IsBlocking = request.IsBlocking,
            DueDate = request.DueDate,
            SlaMinutes = request.SlaMinutes,
            ResponseDueDate = request.ResponseDueDate,
            AssignedToUserId = request.AssignedToUserId,
            ReportedByUserId = request.ReportedByUserId,
            WorkTaskId = request.WorkTaskId,
            Location = request.Location,
            Discipline = request.Discipline,
            RfiQuestion = request.RfiQuestion,
            ExternalReference = request.ExternalReference,
            CreatedAt = DateTime.UtcNow
        };

        issue.ReferenceCode = await GenerateReferenceCodeAsync(request.ProjectId, cancellationToken);

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Issue {Reference} criada para projeto {ProjectId}", issue.ReferenceCode, issue.ProjectId);

        return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, MapToDetail(await LoadIssueAsync(issue.Id, cancellationToken)));
    }

    /// <summary>
    /// Update issue status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateIssueStatus(Guid id, [FromBody] IssueStatus status, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (issue == null)
        {
            return NotFound();
        }

        issue.Status = status;
        issue.UpdatedAt = DateTime.UtcNow;

        if (status == IssueStatus.Resolved || status == IssueStatus.Closed)
        {
            issue.ResolvedAt = DateTime.UtcNow;
            if (issue.IsRFI)
            {
                issue.RespondedAt ??= DateTime.UtcNow;
            }
        }

        if (status == IssueStatus.AwaitingResponse && issue.ResponseDueDate is null && issue.SlaMinutes.HasValue)
        {
            issue.ResponseDueDate = DateTime.UtcNow.AddMinutes(issue.SlaMinutes.Value);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Update an existing issue
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIssue(Guid id, [FromBody] IssueUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (issue == null)
        {
            return NotFound();
        }

        issue.Title = request.Title;
        issue.Description = request.Description;
        issue.Type = request.Type;
        issue.Priority = request.Priority;
        issue.Status = request.Status;
        issue.IsBlocking = request.IsBlocking;
        issue.DueDate = request.DueDate;
        issue.SlaMinutes = request.SlaMinutes;
        issue.ResponseDueDate = request.ResponseDueDate;
        issue.AssignedToUserId = request.AssignedToUserId;
        issue.ReportedByUserId = request.ReportedByUserId;
        issue.RespondedByUserId = request.RespondedByUserId;
        issue.WorkTaskId = request.WorkTaskId;
        issue.Location = request.Location;
        issue.Discipline = request.Discipline;
        issue.Resolution = request.Resolution;
        issue.RfiQuestion = request.RfiQuestion;
        issue.RfiAnswer = request.RfiAnswer;
        issue.ExternalReference = request.ExternalReference;
        issue.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.RfiAnswer))
        {
            issue.RespondedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Add a comment to an issue thread
    /// </summary>
    [HttpPost("{id}/comments")]
    public async Task<ActionResult<IssueCommentDto>> AddComment(Guid id, [FromBody] IssueCommentCreateRequest request, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (issue == null)
        {
            return NotFound();
        }

        var comment = new IssueComment
        {
            Id = Guid.NewGuid(),
            IssueId = id,
            Message = request.Message,
            IsInternal = request.IsInternal,
            AuthorId = request.AuthorId,
            CreatedAt = DateTime.UtcNow
        };

        if (request.Attachments != null)
        {
            foreach (var attachmentRequest in request.Attachments)
            {
                comment.Attachments.Add(new IssueAttachment
                {
                    Id = Guid.NewGuid(),
                    IssueId = id,
                    FileName = attachmentRequest.FileName,
                    FileUrl = attachmentRequest.FileUrl,
                    ContentType = attachmentRequest.ContentType,
                    FileSize = attachmentRequest.FileSize,
                    UploadedByUserId = attachmentRequest.UploadedByUserId,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        _context.IssueComments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        comment = await _context.IssueComments
            .AsNoTracking()
            .Where(c => c.Id == comment.Id)
            .Include(c => c.Author)
            .Include(c => c.Attachments).ThenInclude(a => a.UploadedByUser)
            .FirstAsync(cancellationToken);

        return CreatedAtAction(nameof(GetIssueComments), new { id }, MapToCommentDto(comment));
    }

    /// <summary>
    /// Get comments for an issue thread
    /// </summary>
    [HttpGet("{id}/comments")]
    public async Task<ActionResult<IEnumerable<IssueCommentDto>>> GetIssueComments(Guid id, CancellationToken cancellationToken = default)
    {
        var issueExists = await _context.Issues.AnyAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (!issueExists)
        {
            return NotFound();
        }

        var comments = await _context.IssueComments
            .AsNoTracking()
            .Where(c => c.IssueId == id)
            .Include(c => c.Author)
            .Include(c => c.Attachments).ThenInclude(a => a.UploadedByUser)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return comments.Select(MapToCommentDto).ToList();
    }

    /// <summary>
    /// Link an issue to another entity or external reference
    /// </summary>
    [HttpPost("{id}/links")]
    public async Task<ActionResult<IssueLinkDto>> AddLink(Guid id, [FromBody] IssueLinkCreateRequest request, CancellationToken cancellationToken = default)
    {
        var issueExists = await _context.Issues.AnyAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (!issueExists)
        {
            return NotFound();
        }

        var link = new IssueLink
        {
            Id = Guid.NewGuid(),
            IssueId = id,
            LinkType = request.LinkType,
            RelatedEntityId = request.RelatedEntityId,
            ExternalReference = request.ExternalReference,
            Label = request.Label,
            Metadata = request.Metadata,
            CreatedAt = DateTime.UtcNow
        };

        _context.IssueLinks.Add(link);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetIssue), new { id }, MapToLinkDto(link));
    }

    /// <summary>
    /// Remove a link from an issue
    /// </summary>
    [HttpDelete("{id}/links/{linkId}")]
    public async Task<IActionResult> RemoveLink(Guid id, Guid linkId, CancellationToken cancellationToken = default)
    {
        var link = await _context.IssueLinks.FirstOrDefaultAsync(l => l.Id == linkId && l.IssueId == id, cancellationToken);
        if (link == null)
        {
            return NotFound();
        }

        _context.IssueLinks.Remove(link);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Delete issue (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(Guid id, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (issue == null)
        {
            return NotFound();
        }

        issue.IsDeleted = true;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<string> GenerateReferenceCodeAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var todayPrefix = DateTime.UtcNow.ToString("yyyyMMdd");
        var dailyCount = await _context.Issues
            .CountAsync(i => i.ProjectId == projectId && i.CreatedAt.Date == DateTime.UtcNow.Date, cancellationToken);
        return $"ISS-{todayPrefix}-{dailyCount + 1:0000}";
    }

    private async Task<Issue> LoadIssueAsync(Guid issueId, CancellationToken cancellationToken)
    {
        return await _context.Issues
            .AsNoTracking()
            .Where(i => i.Id == issueId)
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .Include(i => i.RespondedByUser)
            .Include(i => i.WorkTask)
            .Include(i => i.Attachments).ThenInclude(a => a.UploadedByUser)
            .Include(i => i.Comments).ThenInclude(c => c.Author)
            .Include(i => i.Comments).ThenInclude(c => c.Attachments).ThenInclude(a => a.UploadedByUser)
            .Include(i => i.Links)
            .FirstAsync(cancellationToken);
    }

    private static IssueSummaryDto MapToSummary(Issue issue)
    {
        return new IssueSummaryDto(
            issue.Id,
            issue.ProjectId,
            issue.ReferenceCode,
            issue.Title,
            issue.Type,
            issue.Priority,
            issue.Status,
            issue.IsRFI,
            issue.IsBlocking,
            issue.CreatedAt,
            issue.UpdatedAt,
            issue.DueDate,
            issue.SlaMinutes,
            issue.ResponseDueDate,
            issue.RespondedAt,
            issue.AssignedToUserId,
            issue.AssignedToUser is null ? null : string.Concat(issue.AssignedToUser.FirstName, " ", issue.AssignedToUser.LastName).Trim(),
            issue.ReportedByUserId,
            issue.ReportedByUser is null ? null : string.Concat(issue.ReportedByUser.FirstName, " ", issue.ReportedByUser.LastName).Trim(),
            issue.RespondedByUserId,
            issue.RespondedByUser is null ? null : string.Concat(issue.RespondedByUser.FirstName, " ", issue.RespondedByUser.LastName).Trim(),
            issue.WorkTaskId,
            issue.WorkTask?.Title,
            issue.Location,
            issue.Discipline
        );
    }

    private static IssueDetailDto MapToDetail(Issue issue)
    {
        var summary = MapToSummary(issue);
        var attachments = issue.Attachments
            .Where(a => a.CommentId == null)
            .Select(MapToAttachmentDto)
            .ToList();

        var comments = issue.Comments
            .OrderBy(c => c.CreatedAt)
            .Select(MapToCommentDto)
            .ToList();

        var links = issue.Links.Select(MapToLinkDto).ToList();

        return new IssueDetailDto(
            summary,
            issue.Description,
            issue.Resolution,
            issue.RfiQuestion,
            issue.RfiAnswer,
            issue.ExternalReference,
            attachments,
            comments,
            links
        );
    }

    private static IssueAttachmentDto MapToAttachmentDto(IssueAttachment attachment)
    {
        return new IssueAttachmentDto(
            attachment.Id,
            attachment.FileName,
            attachment.FileUrl,
            attachment.ContentType,
            attachment.FileSize,
            attachment.UploadedByUserId,
            attachment.UploadedByUser is null ? null : string.Concat(attachment.UploadedByUser.FirstName, " ", attachment.UploadedByUser.LastName).Trim(),
            attachment.CommentId
        );
    }

    private static IssueCommentDto MapToCommentDto(IssueComment comment)
    {
        var attachments = comment.Attachments.Select(MapToAttachmentDto).ToList();
        return new IssueCommentDto(
            comment.Id,
            comment.Message,
            comment.IsInternal,
            comment.CreatedAt,
            comment.UpdatedAt,
            comment.AuthorId,
            comment.Author is null ? null : string.Concat(comment.Author.FirstName, " ", comment.Author.LastName).Trim(),
            attachments
        );
    }

    private static IssueLinkDto MapToLinkDto(IssueLink link)
    {
        return new IssueLinkDto(
            link.Id,
            link.LinkType,
            link.RelatedEntityId,
            link.ExternalReference,
            link.Label,
            link.Metadata
        );
    }
}

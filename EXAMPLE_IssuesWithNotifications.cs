using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.API.Models;
using Arxis.API.Services;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Controllers;

/// <summary>
/// Example: Issues Controller with Email Notifications
/// Demonstrates integration with avx-cell inspired email system
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IssuesWithNotificationsController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<IssuesWithNotificationsController> _logger;

    public IssuesWithNotificationsController(
        ArxisDbContext context,
        INotificationService notificationService,
        ILogger<IssuesWithNotificationsController> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Create issue with automatic email notification
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<IssueDetailDto>> CreateIssueWithNotification(
        [FromBody] IssueCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        // Validate project exists
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && !p.IsDeleted, cancellationToken);

        if (project == null)
        {
            return BadRequest($"Projeto {request.ProjectId} não encontrado ou inativo.");
        }

        // Create the issue
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

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Issue {IssueId} criada para projeto {ProjectId}", issue.Id, issue.ProjectId);

        // 📧 Send email notification if user is assigned
        if (request.AssignedToUserId.HasValue)
        {
            var assignedUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.AssignedToUserId.Value, cancellationToken);

            if (assignedUser != null && !string.IsNullOrEmpty(assignedUser.Email))
            {
                try
                {
                    await _notificationService.NotifyIssueAssignedAsync(
                        assignedUser.Id.ToString(),
                        assignedUser.Email,
                        issue.Title,
                        project.Name
                    );

                    _logger.LogInformation(
                        "Email notification sent to {Email} for issue {IssueId}",
                        assignedUser.Email,
                        issue.Id
                    );
                }
                catch (Exception ex)
                {
                    // Don't fail the request if email fails
                    _logger.LogWarning(ex,
                        "Failed to send email notification for issue {IssueId}",
                        issue.Id
                    );
                }
            }
        }

        // Load complete issue data
        var createdIssue = await _context.Issues
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .FirstOrDefaultAsync(i => i.Id == issue.Id, cancellationToken);

        return CreatedAtAction(
            nameof(GetIssue),
            new { id = issue.Id },
            MapToDetail(createdIssue!)
        );
    }

    /// <summary>
    /// Update issue assignment with notification
    /// </summary>
    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> AssignIssueWithNotification(
        Guid id,
        [FromBody] AssignIssueRequest request,
        CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);

        if (issue == null)
        {
            return NotFound();
        }

        var newAssignee = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (newAssignee == null)
        {
            return BadRequest("Usuário não encontrado");
        }

        issue.AssignedToUserId = request.UserId;
        issue.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // 📧 Send notification email
        if (!string.IsNullOrEmpty(newAssignee.Email))
        {
            try
            {
                await _notificationService.NotifyIssueAssignedAsync(
                    newAssignee.Id.ToString(),
                    newAssignee.Email,
                    issue.Title,
                    issue.Project?.Name ?? "Desconhecido"
                );

                _logger.LogInformation(
                    "Assignment notification sent to {Email} for issue {IssueId}",
                    newAssignee.Email,
                    issue.Id
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to send assignment notification for issue {IssueId}",
                    issue.Id
                );
            }
        }

        return NoContent();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IssueDetailDto>> GetIssue(Guid id, CancellationToken cancellationToken = default)
    {
        var issue = await _context.Issues
            .AsNoTracking()
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .Include(i => i.Project)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);

        if (issue == null)
        {
            return NotFound();
        }

        return MapToDetail(issue);
    }

    #region Helper Methods

    private static IssueDetailDto MapToDetail(Issue issue)
    {
        return new IssueDetailDto
        {
            Id = issue.Id,
            ProjectId = issue.ProjectId,
            Title = issue.Title,
            Description = issue.Description,
            Type = issue.Type.ToString(),
            Priority = issue.Priority.ToString(),
            Status = issue.Status.ToString(),
            IsRfi = issue.IsRFI,
            AssignedToName = issue.AssignedToUser?.Name,
            ReportedByName = issue.ReportedByUser?.Name,
            CreatedAt = issue.CreatedAt,
            UpdatedAt = issue.UpdatedAt
        };
    }

    #endregion
}

#region Request Models

public class AssignIssueRequest
{
    public Guid UserId { get; set; }
}

#endregion

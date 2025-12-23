using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Controllers;

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
    public async Task<ActionResult<IEnumerable<Issue>>> GetProjectIssues(Guid projectId, [FromQuery] bool? isRFI = null)
    {
        IQueryable<Issue> query = _context.Issues
            .Where(i => i.ProjectId == projectId && !i.IsDeleted)
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser);

        if (isRFI.HasValue)
        {
            query = query.Where(i => i.IsRFI == isRFI.Value);
        }

        return await query.ToListAsync();
    }

    /// <summary>
    /// Get issue by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Issue>> GetIssue(Guid id)
    {
        var issue = await _context.Issues
            .Where(i => !i.IsDeleted)
            .Include(i => i.AssignedToUser)
            .Include(i => i.ReportedByUser)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (issue == null)
        {
            return NotFound();
        }

        return issue;
    }

    /// <summary>
    /// Create new issue
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Issue>> CreateIssue(Issue issue)
    {
        issue.Id = Guid.NewGuid();
        issue.CreatedAt = DateTime.UtcNow;
        issue.Status = IssueStatus.Open;

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, issue);
    }

    /// <summary>
    /// Update issue status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateIssueStatus(Guid id, [FromBody] IssueStatus status)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null || issue.IsDeleted)
        {
            return NotFound();
        }

        issue.Status = status;
        issue.UpdatedAt = DateTime.UtcNow;

        if (status == IssueStatus.Resolved || status == IssueStatus.Closed)
        {
            issue.ResolvedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Update existing issue
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIssue(Guid id, Issue issue)
    {
        if (id != issue.Id)
        {
            return BadRequest();
        }

        var existingIssue = await _context.Issues.FindAsync(id);
        if (existingIssue == null || existingIssue.IsDeleted)
        {
            return NotFound();
        }

        existingIssue.Title = issue.Title;
        existingIssue.Description = issue.Description;
        existingIssue.Type = issue.Type;
        existingIssue.Priority = issue.Priority;
        existingIssue.Status = issue.Status;
        existingIssue.DueDate = issue.DueDate;
        existingIssue.AssignedToUserId = issue.AssignedToUserId;
        existingIssue.Resolution = issue.Resolution;
        existingIssue.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete issue (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(Guid id)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null || issue.IsDeleted)
        {
            return NotFound();
        }

        issue.IsDeleted = true;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

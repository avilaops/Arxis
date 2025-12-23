using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;
using TaskStatus = Arxis.Domain.Entities.TaskStatus;

namespace Arxis.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ArxisDbContext context, ILogger<TasksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all tasks for a project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetProjectTasks(Guid projectId)
    {
        return await _context.WorkTasks
            .Where(t => t.ProjectId == projectId && !t.IsDeleted)
            .Include(t => t.AssignedToUser)
            .Include(t => t.SubTasks)
            .ToListAsync();
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkTask>> GetTask(Guid id)
    {
        var task = await _context.WorkTasks
            .Where(t => !t.IsDeleted)
            .Include(t => t.AssignedToUser)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return NotFound();
        }

        return task;
    }

    /// <summary>
    /// Create new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WorkTask>> CreateTask(WorkTask task)
    {
        task.Id = Guid.NewGuid();
        task.CreatedAt = DateTime.UtcNow;
        task.Status = TaskStatus.Backlog;

        _context.WorkTasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Update task status
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] TaskStatus status)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null || task.IsDeleted)
        {
            return NotFound();
        }

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;

        if (status == TaskStatus.Done)
        {
            task.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Update existing task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, WorkTask task)
    {
        if (id != task.Id)
        {
            return BadRequest();
        }

        var existingTask = await _context.WorkTasks.FindAsync(id);
        if (existingTask == null || existingTask.IsDeleted)
        {
            return NotFound();
        }

        existingTask.Title = task.Title;
        existingTask.Description = task.Description;
        existingTask.Status = task.Status;
        existingTask.Priority = task.Priority;
        existingTask.DueDate = task.DueDate;
        existingTask.AssignedToUserId = task.AssignedToUserId;
        existingTask.Tags = task.Tags;
        existingTask.Checklist = task.Checklist;
        existingTask.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete task (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var task = await _context.WorkTasks.FindAsync(id);
        if (task == null || task.IsDeleted)
        {
            return NotFound();
        }

        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

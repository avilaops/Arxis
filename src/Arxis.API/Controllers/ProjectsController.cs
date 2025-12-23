using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;

namespace Arxis.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(ArxisDbContext context, ILogger<ProjectsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all projects
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        return await _context.Projects
            .Where(p => !p.IsDeleted)
            .Include(p => p.ProjectUsers)
            .ThenInclude(pu => pu.User)
            .ToListAsync();
    }

    /// <summary>
    /// Get project by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var project = await _context.Projects
            .Where(p => !p.IsDeleted)
            .Include(p => p.ProjectUsers)
            .ThenInclude(pu => pu.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        return project;
    }

    /// <summary>
    /// Create new project
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(Project project)
    {
        project.Id = Guid.NewGuid();
        project.CreatedAt = DateTime.UtcNow;
        project.Status = ProjectStatus.Planning;

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    /// <summary>
    /// Update existing project
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, Project project)
    {
        if (id != project.Id)
        {
            return BadRequest();
        }

        var existingProject = await _context.Projects.FindAsync(id);
        if (existingProject == null || existingProject.IsDeleted)
        {
            return NotFound();
        }

        existingProject.Name = project.Name;
        existingProject.Description = project.Description;
        existingProject.Client = project.Client;
        existingProject.Address = project.Address;
        existingProject.City = project.City;
        existingProject.State = project.State;
        existingProject.Country = project.Country;
        existingProject.Currency = project.Currency;
        existingProject.StartDate = project.StartDate;
        existingProject.EndDate = project.EndDate;
        existingProject.ContractDate = project.ContractDate;
        existingProject.TotalBudget = project.TotalBudget;
        existingProject.Status = project.Status;
        existingProject.Type = project.Type;
        existingProject.Tags = project.Tags;
        existingProject.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete project (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null || project.IsDeleted)
        {
            return NotFound();
        }

        project.IsDeleted = true;
        project.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

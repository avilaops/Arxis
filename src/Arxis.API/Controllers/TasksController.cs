using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Arxis.API.Models;
using Arxis.Domain.Entities;
using Arxis.Infrastructure.Data;
using TaskStatus = Arxis.Domain.Entities.TaskStatus;
using TaskPriority = Arxis.Domain.Entities.TaskPriority;

namespace Arxis.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ArxisDbContext _context;
    private readonly ILogger<TasksController> _logger;

    private static readonly IReadOnlyList<WorkflowStepSeed> DefaultWorkflowSteps = new List<WorkflowStepSeed>
    {
        new(
            "Registro e triagem automática",
            "Bot Arxis Intake",
            2,
            true,
            "Formulário web, aplicativo offline ou API",
            "Categoria, tags e responsáveis sugeridos"
        ),
        new(
            "Priorização e kick-off",
            "Squad Líder",
            8,
            false,
            "Dados enriquecidos e stakeholders notificados",
            "Plano de ação criado e sprint associada"
        ),
        new(
            "Execução e checklists de campo",
            "Time Operações",
            24,
            false,
            "Checklist de segurança aprovado",
            "Checklist e fotos sincronizadas com sucesso"
        ),
        new(
            "Aprovação multi-nível",
            "Financeiro + Engenharia",
            12,
            true,
            "Medições, custos e anexos verificados",
            "Aprovação automática com trilha de auditoria"
        ),
        new(
            "Encerramento e analytics preditivo",
            "PMO",
            6,
            true,
            "Todos stakeholders cientes e RFI encerradas",
            "Insights preditivos e lições registradas"
        ),
    };

    private static readonly IReadOnlyList<DemoTaskSeed> DemoTasks = new List<DemoTaskSeed>
    {
        new(
            "Liberar frente de serviços estruturais",
            "Coordenar equipe e liberar checklists de segurança para início da concretagem.",
            TaskStatus.InProgress,
            TaskPriority.P2_High,
            1,
            55,
            "Estruturas",
            "Squad Estruturas",
            new[] { "Obra A", "Frente norte" },
            8,
            5,
            36,
            36
        ),
        new(
            "Revisar memorial descritivo",
            "Garantir aderência do memorial com revisões do cliente e normas atualizadas.",
            TaskStatus.Review,
            TaskPriority.P3_Medium,
            2,
            80,
            "PMO",
            "PMO Central",
            new[] { "Portfólio Corporativo" },
            6,
            5,
            28,
            28
        ),
        new(
            "Emitir pedido de compra concreto fck45",
            "Orçar, aprovar e emitir pedido junto ao fornecedor homologado.",
            TaskStatus.Todo,
            TaskPriority.P1_Critical,
            0,
            20,
            "Suprimentos",
            "Equipe Suprimentos",
            new[] { "Orçamento", "Fornecedor" },
            5,
            1,
            14,
            14
        ),
        new(
            "Auditar diário de obra",
            "Validar registros, fotos e medições enviados via app offline.",
            TaskStatus.Blocked,
            TaskPriority.P2_High,
            -1,
            35,
            "Qualidade & SSMA",
            "Qualidade Canteiro",
            new[] { "Checklist", "Qualidade" },
            7,
            2,
            72,
            72
        ),
        new(
            "Gerar relatório executivo semanal",
            "Compilar indicadores e simulações preditivas automáticas.",
            TaskStatus.Todo,
            TaskPriority.P3_Medium,
            3,
            10,
            "Analytics",
            "Inteligência de Dados",
            new[] { "Analytics", "Preditivo" },
            4,
            0,
            10,
            10
        ),
        new(
            "Atualizar integração ERP Totvs",
            "Sincronizar centro de custos e medições com contrato revisado.",
            TaskStatus.InProgress,
            TaskPriority.P1_Critical,
            7,
            45,
            "Integrações",
            "Time Integrações",
            new[] { "Integrações", "Financeiro" },
            6,
            3,
            30,
            30
        ),
        new(
            "Implementar checklist de segurança NR-35",
            "Configurar formulário offline com automações de alerta.",
            TaskStatus.InProgress,
            TaskPriority.P2_High,
            5,
            60,
            "Qualidade & SSMA",
            "Qualidade Canteiro",
            new[] { "Field", "Segurança" },
            9,
            5,
            40,
            40
        ),
        new(
            "Validar cronograma 4D com modelo BIM",
            "Conferir vínculos Revit e simular cenário pessimista.",
            TaskStatus.Review,
            TaskPriority.P2_High,
            4,
            75,
            "Modelagem",
            "Modelagem 4D",
            new[] { "BIM", "Timeline" },
            5,
            4,
            32,
            32
        ),
        new(
            "Encerrar pendências críticas RFI-231",
            "Consolidar respostas e anexos e atualizar stakeholders externos.",
            TaskStatus.Todo,
            TaskPriority.P2_High,
            2,
            5,
            "Engenharia",
            "Coordenação Engenharia",
            new[] { "RFI", "Stakeholders" },
            3,
            0,
            12,
            12
        ),
        new(
            "Planejar sprint de manutenção corretiva",
            "Definir backlog e atribuir recursos compartilhados.",
            TaskStatus.Backlog,
            TaskPriority.P4_Low,
            12,
            0,
            "Operações",
            "Operações Norte",
            new[] { "Portfólio Corporativo" },
            4,
            0,
            5,
            5
        ),
        new(
            "Publicar dashboard stakeholders",
            "Liberar visão externa com filtros de compliance.",
            TaskStatus.InProgress,
            TaskPriority.P3_Medium,
            6,
            40,
            "Analytics",
            "Inteligência de Dados",
            new[] { "Stakeholders", "Analytics" },
            5,
            2,
            24,
            24
        ),
        new(
            "Sincronizar telemetria de equipamentos",
            "Configurar gateway IoT e correlação com produtividade.",
            TaskStatus.Done,
            TaskPriority.P2_High,
            -2,
            100,
            "Operações",
            "Operações Norte",
            new[] { "IoT", "Produtividade" },
            6,
            6,
            20,
            20
        )
    };

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
            .AsNoTracking()
            .ToListAsync();
    }

    /// <summary>
    /// Retorna tarefas e workflow enriquecidos para o board
    /// </summary>
    [HttpGet("project/{projectId}/board")]
    [AllowAnonymous]
    public async Task<ActionResult<TaskBoardResponse>> GetProjectBoard(Guid projectId)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted);

        if (project == null)
        {
            return NotFound("Projeto não encontrado.");
        }

        var response = await BuildBoardResponse(project);
        return Ok(response);
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
        task.ProgressPercent = DeriveProgressPercent(task);

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
        task.ProgressPercent = status == TaskStatus.Done ? 100 : DeriveProgressPercent(task);

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
        existingTask.AssigneeName = task.AssigneeName;
        existingTask.Squad = task.Squad;
        existingTask.Tags = task.Tags;
        existingTask.Checklist = task.Checklist;
        existingTask.ProgressPercent = DeriveProgressPercent(existingTask);
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

    /// <summary>
    /// Atualiza workflow do projeto
    /// </summary>
    [HttpPut("project/{projectId}/workflow")]
    [AllowAnonymous]
    public async Task<ActionResult<TaskWorkflowResponse>> UpsertWorkflow(Guid projectId, [FromBody] UpsertTaskWorkflowRequest request)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted);
        if (project == null)
        {
            return NotFound("Projeto não encontrado.");
        }

        if (request == null)
        {
            return BadRequest("Payload inválido.");
        }

        var workflow = await _context.TaskWorkflows
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.ProjectId == projectId && !w.IsDeleted);

        if (workflow == null)
        {
            workflow = new TaskWorkflow
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Name = string.IsNullOrWhiteSpace(request.Name) ? $"Workflow {project.Name}" : request.Name!,
                CreatedAt = DateTime.UtcNow,
            };
            _context.TaskWorkflows.Add(workflow);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                workflow.Name = request.Name!;
            }

            workflow.UpdatedAt = DateTime.UtcNow;
            if (workflow.Steps.Any())
            {
                _context.TaskWorkflowSteps.RemoveRange(workflow.Steps);
                workflow.Steps.Clear();
            }
        }

        var now = DateTime.UtcNow;
        var orderedSteps = request.Steps
            .OrderBy(step => step.OrderIndex)
            .Select((step, index) => new TaskWorkflowStep
            {
                Id = step.Id == null || step.Id == Guid.Empty ? Guid.NewGuid() : step.Id.Value,
                TaskWorkflowId = workflow.Id,
                TaskWorkflow = workflow,
                OrderIndex = index,
                Name = step.Name,
                OwnerRole = step.OwnerRole,
                SlaHours = step.SlaHours,
                Automation = step.Automation,
                EntryCriteria = step.EntryCriteria,
                ExitCriteria = step.ExitCriteria,
                CreatedAt = now,
            })
            .ToList();

        foreach (var step in orderedSteps)
        {
            workflow.Steps.Add(step);
        }

        await _context.SaveChangesAsync();

        workflow = await _context.TaskWorkflows
            .Include(w => w.Steps.Where(step => !step.IsDeleted))
            .FirstAsync(w => w.Id == workflow.Id);

        return Ok(MapWorkflow(workflow));
    }

    /// <summary>
    /// Gera dados demo para o board
    /// </summary>
    [HttpPost("project/{projectId}/seed-demo")]
    [AllowAnonymous]
    public async Task<ActionResult<TaskBoardResponse>> SeedDemo(Guid projectId)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && !p.IsDeleted);
        if (project == null)
        {
            return NotFound("Projeto não encontrado.");
        }

        var existing = await _context.WorkTasks
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();

        if (existing.Any())
        {
            _context.WorkTasks.RemoveRange(existing);
        }

        var now = DateTime.UtcNow;
        foreach (var seed in DemoTasks)
        {
            var createdAt = now.AddHours(-seed.CreatedHoursAgo);
            var dueDate = seed.DueInDays.HasValue ? DateTime.UtcNow.Date.AddDays(seed.DueInDays.Value).AddHours(18) : (DateTime?)null;

            var task = new WorkTask
            {
                Id = Guid.NewGuid(),
                Title = seed.Title,
                Description = seed.Description,
                Status = seed.Status,
                Priority = seed.Priority,
                DueDate = dueDate,
                ProjectId = projectId,
                Squad = seed.Squad,
                AssigneeName = seed.AssigneeName,
                Tags = seed.Tags.ToList(),
                CreatedAt = createdAt,
                UpdatedAt = createdAt,
                CreatedBy = "seed",
                ProgressPercent = seed.ProgressPercent,
                Checklist = BuildChecklist(seed.ChecklistTotal, seed.ChecklistDone),
            };

            if (seed.Status == TaskStatus.Done)
            {
                task.CompletedAt = createdAt.AddHours(seed.CycleTimeHours);
                if (task.CompletedAt > now)
                {
                    task.CompletedAt = now;
                }
            }

            _context.WorkTasks.Add(task);
        }

        await _context.SaveChangesAsync();

        var workflowEntity = await EnsureWorkflow(project.Id, project.Name);
        var response = await BuildBoardResponse(project, workflowEntity);
        return Ok(response);
    }

    private async Task<TaskBoardResponse> BuildBoardResponse(Project project, TaskWorkflow? workflowEntity = null)
    {
        var tasks = await _context.WorkTasks
            .Where(t => t.ProjectId == project.Id && !t.IsDeleted)
            .Include(t => t.AssignedToUser)
            .AsNoTracking()
            .ToListAsync();

        workflowEntity ??= await EnsureWorkflow(project.Id, project.Name);

        var taskItems = tasks
            .Select(MapTask)
            .OrderByDescending(task => task.Status == TaskStatus.Done)
            .ThenByDescending(task => task.ProgressPercent)
            .ToList();

        var workflow = MapWorkflow(workflowEntity);
        return new TaskBoardResponse(project.Id, project.Name, taskItems, workflow);
    }

    private TaskBoardItemResponse MapTask(WorkTask task)
    {
        var checklistTotal = task.Checklist?.Count ?? 0;
        var checklistDone = task.Checklist?.Count(item => item.IsCompleted) ?? 0;
        var progress = task.ProgressPercent > 0 ? task.ProgressPercent : DeriveProgressPercent(task, checklistDone, checklistTotal);

        var cycleTimeHours = Math.Max(0,
            Math.Round(((task.CompletedAt ?? DateTime.UtcNow) - task.CreatedAt).TotalHours, 1));

        var assignee = task.AssignedToUser != null
            ? $"{task.AssignedToUser.FirstName} {task.AssignedToUser.LastName}".Trim()
            : task.AssigneeName;

        return new TaskBoardItemResponse(
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            (int)progress,
            task.Squad,
            task.AssignedToUserId,
            string.IsNullOrWhiteSpace(assignee) ? null : assignee,
            task.Tags,
            checklistTotal,
            checklistDone,
            cycleTimeHours,
            task.CreatedAt,
            task.CompletedAt
        );
    }

    private TaskWorkflowResponse MapWorkflow(TaskWorkflow workflow)
    {
        var steps = workflow.Steps
            .Where(step => !step.IsDeleted)
            .OrderBy(step => step.OrderIndex)
            .Select(step => new TaskWorkflowStepResponse(
                step.Id,
                step.OrderIndex,
                step.Name,
                step.OwnerRole,
                step.SlaHours,
                step.Automation,
                step.EntryCriteria,
                step.ExitCriteria
            ))
            .ToList();

        return new TaskWorkflowResponse(workflow.Id, workflow.Name, steps);
    }

    private async Task<TaskWorkflow> EnsureWorkflow(Guid projectId, string projectName)
    {
        var workflow = await _context.TaskWorkflows
            .Include(w => w.Steps.Where(step => !step.IsDeleted))
            .FirstOrDefaultAsync(w => w.ProjectId == projectId && !w.IsDeleted);

        if (workflow == null)
        {
            workflow = new TaskWorkflow
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Name = $"Workflow {projectName}",
                CreatedAt = DateTime.UtcNow,
            };

            foreach (var step in CreateDefaultSteps(workflow))
            {
                workflow.Steps.Add(step);
            }

            _context.TaskWorkflows.Add(workflow);
            await _context.SaveChangesAsync();
        }
        else if (!workflow.Steps.Any())
        {
            foreach (var step in CreateDefaultSteps(workflow))
            {
                workflow.Steps.Add(step);
            }

            await _context.SaveChangesAsync();
        }

        return workflow;
    }

    private static IEnumerable<TaskWorkflowStep> CreateDefaultSteps(TaskWorkflow workflow)
    {
        var now = DateTime.UtcNow;
        return DefaultWorkflowSteps.Select((seed, index) => new TaskWorkflowStep
        {
            Id = Guid.NewGuid(),
            TaskWorkflowId = workflow.Id,
            TaskWorkflow = workflow,
            OrderIndex = index,
            Name = seed.Name,
            OwnerRole = seed.OwnerRole,
            SlaHours = seed.SlaHours,
            Automation = seed.Automation,
            EntryCriteria = seed.EntryCriteria,
            ExitCriteria = seed.ExitCriteria,
            CreatedAt = now,
        });
    }

    private static List<TaskChecklistItem> BuildChecklist(int total, int completed)
    {
        var items = new List<TaskChecklistItem>();
        for (var index = 1; index <= total; index++)
        {
            items.Add(new TaskChecklistItem
            {
                Title = $"Checklist #{index}",
                IsCompleted = index <= completed,
            });
        }

        return items;
    }

    private static int DeriveProgressPercent(WorkTask task)
    {
        var total = task.Checklist?.Count ?? 0;
        var done = task.Checklist?.Count(item => item.IsCompleted) ?? 0;
        return (int)DeriveProgressPercent(task, done, total);
    }

    private static double DeriveProgressPercent(WorkTask task, int done, int total)
    {
        if (total > 0)
        {
            return Math.Round((double)done / total * 100, 0);
        }

        return task.Status == TaskStatus.Done ? 100 : task.ProgressPercent;
    }

    private sealed record WorkflowStepSeed(
        string Name,
        string OwnerRole,
        int SlaHours,
        bool Automation,
        string EntryCriteria,
        string ExitCriteria
    );

    private sealed record DemoTaskSeed(
        string Title,
        string Description,
        TaskStatus Status,
        TaskPriority Priority,
        int? DueInDays,
        int ProgressPercent,
        string Squad,
        string AssigneeName,
        string[] Tags,
        int ChecklistTotal,
        int ChecklistDone,
        int CreatedHoursAgo,
        int CycleTimeHours
    );
}

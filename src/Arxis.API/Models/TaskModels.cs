using System;
using System.Collections.Generic;
using Arxis.Domain.Entities;
using TaskStatus = Arxis.Domain.Entities.TaskStatus;
using TaskPriority = Arxis.Domain.Entities.TaskPriority;

namespace Arxis.API.Models;

public record TaskBoardResponse(
    Guid ProjectId,
    string ProjectName,
    IReadOnlyCollection<TaskBoardItemResponse> Tasks,
    TaskWorkflowResponse Workflow
);

public record TaskBoardItemResponse(
    Guid Id,
    string Title,
    string? Description,
    TaskStatus Status,
    TaskPriority Priority,
    DateTime? DueDate,
    int ProgressPercent,
    string Squad,
    Guid? AssignedToUserId,
    string? AssignedToUserName,
    IReadOnlyCollection<string> Tags,
    int ChecklistTotal,
    int ChecklistDone,
    double CycleTimeHours,
    DateTime CreatedAt,
    DateTime? CompletedAt
);

public record TaskWorkflowResponse(
    Guid Id,
    string Name,
    IReadOnlyCollection<TaskWorkflowStepResponse> Steps
);

public record TaskWorkflowStepResponse(
    Guid Id,
    int OrderIndex,
    string Name,
    string OwnerRole,
    int SlaHours,
    bool Automation,
    string EntryCriteria,
    string ExitCriteria
);

public class UpsertTaskWorkflowRequest
{
    public string? Name { get; set; }
    public ICollection<UpsertTaskWorkflowStepRequest> Steps { get; set; } = new List<UpsertTaskWorkflowStepRequest>();
}

public class UpsertTaskWorkflowStepRequest
{
    public Guid? Id { get; set; }
    public int OrderIndex { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerRole { get; set; } = string.Empty;
    public int SlaHours { get; set; }
    public bool Automation { get; set; }
    public string EntryCriteria { get; set; } = string.Empty;
    public string ExitCriteria { get; set; } = string.Empty;
}

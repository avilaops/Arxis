using System;
using System.Collections.Generic;
using Arxis.Domain.Common;

namespace Arxis.Domain.Entities;

public class TaskWorkflow : BaseEntity
{
    public string Name { get; set; } = "Workflow padrão";
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }
    public ICollection<TaskWorkflowStep> Steps { get; set; } = new List<TaskWorkflowStep>();
}

public class TaskWorkflowStep : BaseEntity
{
    public Guid TaskWorkflowId { get; set; }
    public TaskWorkflow TaskWorkflow { get; set; } = null!;
    public int OrderIndex { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerRole { get; set; } = string.Empty;
    public int SlaHours { get; set; }
    public bool Automation { get; set; }
    public string EntryCriteria { get; set; } = string.Empty;
    public string ExitCriteria { get; set; } = string.Empty;
}

using FluentValidation;
using Arxis.Domain.Entities;

namespace Arxis.API.Validators;

public class WorkTaskValidator : AbstractValidator<WorkTask>
{
    public WorkTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Título da tarefa é obrigatório")
            .MaximumLength(300).WithMessage("Título deve ter no máximo 300 caracteres");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Descrição deve ter no máximo 2000 caracteres");

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ID do projeto é obrigatório");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow).When(x => x.DueDate.HasValue)
            .WithMessage("Data de vencimento deve ser no futuro");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status da tarefa é inválido");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Prioridade da tarefa é inválida");
    }
}

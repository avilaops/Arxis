using FluentValidation;
using Arxis.Domain.Entities;

namespace Arxis.API.Validators;

public class IssueValidator : AbstractValidator<Issue>
{
    public IssueValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Título do issue é obrigatório")
            .MaximumLength(300).WithMessage("Título deve ter no máximo 300 caracteres");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Descrição deve ter no máximo 2000 caracteres");

        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("ID do projeto é obrigatório");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Tipo do issue é inválido");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Prioridade do issue é inválida");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status do issue é inválido");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow).When(x => x.DueDate.HasValue)
            .WithMessage("Data de vencimento deve ser no futuro");

        RuleFor(x => x.Resolution)
            .MaximumLength(2000).WithMessage("Resolução deve ter no máximo 2000 caracteres");
    }
}

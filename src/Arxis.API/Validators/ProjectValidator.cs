using FluentValidation;
using Arxis.Domain.Entities;

namespace Arxis.API.Validators;

public class ProjectValidator : AbstractValidator<Project>
{
    public ProjectValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome do projeto é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Moeda é obrigatória")
            .MaximumLength(3).WithMessage("Código da moeda deve ter no máximo 3 caracteres")
            .Matches("^[A-Z]{3}$").WithMessage("Moeda deve ser um código ISO válido (ex: BRL, USD)");

        RuleFor(x => x.TotalBudget)
            .GreaterThan(0).When(x => x.TotalBudget.HasValue)
            .WithMessage("Orçamento total deve ser maior que zero");

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate).When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("Data de início deve ser anterior à data de término");

        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Client).MaximumLength(200);
        RuleFor(x => x.Address).MaximumLength(500);
        RuleFor(x => x.City).MaximumLength(100);
        RuleFor(x => x.State).MaximumLength(100);
        RuleFor(x => x.Country).MaximumLength(100);
    }
}

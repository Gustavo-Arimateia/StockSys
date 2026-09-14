using FluentValidation;

namespace Application.Features.Products.Commands.ChangeStatus;

public sealed class ChangeProductStatusCommandValidator : AbstractValidator<ChangeProductStatusCommand>
{
  public ChangeProductStatusCommandValidator()
  {
    RuleFor(command => command.Id)
        .GreaterThan(0)
        .WithMessage("O identificador do produto deve ser maior que zero.");
  }
}
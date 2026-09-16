using FluentValidation;

namespace Application.Features.Orders.Commands.ChangeStatus;

public sealed class ChangeOrderStatusCommandValidator : AbstractValidator<ChangeOrderStatusCommand>
{
  public ChangeOrderStatusCommandValidator()
  {
    RuleFor(command => command.Id)
      .GreaterThan(0)
      .WithMessage("O identificador do pedido deve ser maior que zero.");

    RuleFor(command => command.Status)
      .IsInEnum()
      .WithMessage("O status informado é inválido.");
  }
}
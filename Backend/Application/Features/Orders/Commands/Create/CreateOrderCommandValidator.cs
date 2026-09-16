using FluentValidation;

namespace Application.Features.Orders.Commands.Create;

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
  public CreateOrderCommandValidator()
  {
    RuleFor(command => command.Items)
        .NotNull()
        .WithMessage("Os itens do pedido são obrigatórios.")
        .NotEmpty()
        .WithMessage("O pedido deve possuir pelo menos um item.");

    RuleFor(command => command.DiscountPercentage)
        .InclusiveBetween(0, 20)
        .WithMessage("O percentual de desconto deve estar entre 0 e 20.");

    RuleForEach(command => command.Items)
        .ChildRules(item =>
        {
          item.RuleFor(orderItem => orderItem.ProductId)
                  .GreaterThan(0)
                  .WithMessage("O identificador do produto deve ser maior que zero.");

          item.RuleFor(orderItem => orderItem.Quantity)
                  .GreaterThan(0)
                  .WithMessage("A quantidade do item deve ser maior que zero.");
        });

    RuleFor(command => command.Items)
        .Must(HaveDistinctProducts)
        .When(command => command.Items is { Count: > 0 })
        .WithMessage("O pedido não pode possuir o mesmo produto mais de uma vez.");

    RuleFor(command => command.IdempotencyKey)
        .NotEmpty()
        .WithMessage("A chave de idempotência é obrigatória.");
  }

  private static bool HaveDistinctProducts(IReadOnlyCollection<CreateOrderItemCommand> items)
  {
    return items.Select(item => item.ProductId).Distinct().Count() == items.Count;
  }
}
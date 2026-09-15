using FluentValidation;

namespace Application.Features.Orders.Queries.GetById;

public sealed class GetOrderByIdQueryValidator : AbstractValidator<GetOrderByIdQuery>
{
  public GetOrderByIdQueryValidator()
  {
    RuleFor(query => query.Id)
      .GreaterThan(0)
      .WithMessage("O identificador do pedido deve ser maior que zero.");
  }
}
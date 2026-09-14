using FluentValidation;

namespace Application.Features.Products.Queries.GetById;

public sealed class GetProductByIdQueryValidator : AbstractValidator<GetProductByIdQuery>
{
  public GetProductByIdQueryValidator()
  {
    RuleFor(query => query.Id)
        .GreaterThan(0)
        .WithMessage("O identificador do produto deve ser maior que zero.");
  }
}
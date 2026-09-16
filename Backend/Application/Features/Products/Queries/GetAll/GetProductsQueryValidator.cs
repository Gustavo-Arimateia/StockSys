using FluentValidation;

namespace Application.Features.Products.Queries.GetAll;

public sealed class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
{
  private static readonly string[] AllowedSortFields =["id", "name", "price", "stockQuantity", "createdAt"];

  public GetProductsQueryValidator()
  {
    RuleFor(query => query.Page)
        .GreaterThan(0)
        .WithMessage("A página deve ser maior que zero.");

    RuleFor(query => query.PageSize)
        .InclusiveBetween(1, 100)
        .WithMessage("O tamanho da página deve estar entre 1 e 100.");

    RuleFor(query => query.SortBy)
        .Must(sortBy => AllowedSortFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase))
        .WithMessage("Campo de ordenação inválido. Utilize: id, name, price, stockQuantity ou createdAt.");

    RuleFor(query => query.SortDirection)
        .Must(direction => direction.Equals("asc", StringComparison.OrdinalIgnoreCase) || direction.Equals("desc", StringComparison.OrdinalIgnoreCase))
        .WithMessage("A direção da ordenação deve ser 'asc' ou 'desc'.");
  }
}
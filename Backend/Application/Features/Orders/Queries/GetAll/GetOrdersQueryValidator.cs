using Domain.Enums;
using FluentValidation;

namespace Application.Features.Orders.Queries.GetAll;

public sealed class GetOrdersQueryValidator: AbstractValidator<GetOrdersQuery>
{
  private static readonly string[] AllowedSortFields =
  [
    "id",
    "createdAt",
    "status",
    "productsValue",
    "discountValue",
    "totalValue"
  ];

  public GetOrdersQueryValidator()
  {
    RuleFor(query => query.Page)
      .GreaterThan(0)
      .WithMessage("A página deve ser maior que zero.");

    RuleFor(query => query.PageSize)
      .InclusiveBetween(1, 100)
      .WithMessage("A quantidade de registros por página deve estar entre 1 e 100.");

    RuleFor(query => query.SortBy)
      .Must(sortBy => AllowedSortFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase))
      .WithMessage("O campo de ordenação informado é inválido.");

    RuleFor(query => query.SortDirection)
      .Must(direction => direction.Equals("asc", StringComparison.OrdinalIgnoreCase) || direction.Equals("desc", StringComparison.OrdinalIgnoreCase))
      .WithMessage("A direção da ordenação deve ser 'asc' ou 'desc'.");

    RuleFor(query => query)
      .Must(query => !query.StartDate.HasValue || !query.EndDate.HasValue || query.StartDate.Value <= query.EndDate.Value)
      .WithMessage("A data inicial não pode ser maior que a data final.");

    RuleFor(query => query.Status)
      .Must(status => !status.HasValue || Enum.IsDefined(typeof(OrderStatus), status.Value))
      .WithMessage("O status informado é inválido.");
  }
}
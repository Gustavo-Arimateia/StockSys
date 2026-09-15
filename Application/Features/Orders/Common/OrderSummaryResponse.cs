using Domain.Enums;

namespace Application.Features.Orders.Common;

public sealed class OrderSummaryResponse
{
  public int Id { get; init; }

  public DateTime CreatedAt { get; init; }

  public OrderStatus Status { get; init; }

  public decimal ProductsValue { get; init; }

  public decimal DiscountPercentage { get; init; }

  public decimal DiscountValue { get; init; }

  public decimal TotalValue { get; init; }
}
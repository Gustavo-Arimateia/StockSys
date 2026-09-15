using Domain.Entities;

namespace Application.Features.Orders.Common;

public static class OrderMappingExtensions
{
  public static OrderResponse ToResponse(this Order order)
  {
    return new OrderResponse
    {
      Id = order.Id,
      CreatedAt = order.CreatedAt,
      Status = order.Status,
      ProductsValue = order.ProductsValue,
      DiscountPercentage = order.DiscountPercentage,
      DiscountValue = order.DiscountValue,
      TotalValue = order.TotalValue,

      Items = [.. order.Items.Select(item => new OrderItemResponse
      {
          ProductId = item.ProductId,
          ProductName = item.ProductName,
          Quantity = item.Quantity,
          UnitPrice = item.UnitPrice,
          Total = item.Total
      })]
    };
  }

  public static OrderSummaryResponse ToSummaryResponse(this Order order)
  {
    return new OrderSummaryResponse
    {
      Id = order.Id,
      CreatedAt = order.CreatedAt,
      Status = order.Status,
      ProductsValue = order.ProductsValue,
      DiscountPercentage = order.DiscountPercentage,
      DiscountValue = order.DiscountValue,
      TotalValue = order.TotalValue
    };
  }
}
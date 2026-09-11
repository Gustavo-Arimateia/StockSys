using Domain.Entities;

namespace Application.Features.Products.Common;

public static class ProductMappingExtensions
{
  public static ProductResponse ToResponse(this Product product)
  {
    return new ProductResponse
    {
      Id = product.Id,
      Name = product.Name,
      Description = product.Description,
      Price = product.Price,
      StockQuantity = product.StockQuantity,
      IsActive = product.IsActive,
      CreatedAt = product.CreatedAt
    };
  }
}
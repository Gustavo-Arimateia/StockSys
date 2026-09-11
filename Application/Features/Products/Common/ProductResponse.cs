namespace Application.Features.Products.Common;

public sealed class ProductResponse
{
  public int Id { get; init; }

  public string Name { get; init; } = string.Empty;

  public string Description { get; init; } = string.Empty;

  public decimal Price { get; init; }

  public int StockQuantity { get; init; }

  public bool IsActive { get; init; }

  public DateTime CreatedAt { get; init; }
}
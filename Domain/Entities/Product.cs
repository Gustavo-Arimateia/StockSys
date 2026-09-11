namespace Domain.Entities;

public sealed class Product
{
  private Product(){}

  public Product(string name, string description, decimal price, int stockQuantity)
  {
    Name = name;
    Description = description;
    Price = price;
    StockQuantity = stockQuantity;
    IsActive = true;
    CreatedAt = DateTime.UtcNow;
  }

  public int Id { get; private set; }

  public string Name { get; private set; } = string.Empty;

  public string Description { get; private set; } = string.Empty;

  public decimal Price { get; private set; }

  public int StockQuantity { get; private set; }

  public bool IsActive { get; private set; }

  public DateTime CreatedAt { get; private set; }

  public byte[] RowVersion { get; private set; } = [];
}
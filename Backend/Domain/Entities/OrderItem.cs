namespace Domain.Entities;

public sealed class OrderItem
{
  private OrderItem() {}

  public OrderItem(int productId, string productName, int quantity, decimal unitPrice)
  {
    if (productId <= 0)
      throw new ArgumentOutOfRangeException(nameof(productId));

    if (string.IsNullOrWhiteSpace(productName))
      throw new ArgumentException("O nome do produto é obrigatório.", nameof(productName));

    if (quantity <= 0)
      throw new ArgumentOutOfRangeException(nameof(quantity));

    if (unitPrice <= 0)
      throw new ArgumentOutOfRangeException(nameof(unitPrice));

    ProductId = productId;
    ProductName = productName.Trim();
    Quantity = quantity;
    UnitPrice = unitPrice;
    Total = unitPrice * quantity;
  }

  public int Id { get; private set; }

  public int OrderId { get; private set; }

  public int ProductId { get; private set; }

  public string ProductName { get; private set; } = string.Empty;

  public int Quantity { get; private set; }

  public decimal UnitPrice { get; private set; }

  public decimal Total { get; private set; }
}
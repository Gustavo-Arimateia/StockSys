using Domain.Enums;

namespace Domain.Entities;

public sealed class Order
{
  private const decimal MaximumDiscountPercentage = 20m;

  private readonly List<OrderItem> _items = [];

  private Order() { }

  public Order(IEnumerable<OrderItem> items, decimal discountPercentage, Guid idempotencyKey, string requestHash)
  {
    ArgumentNullException.ThrowIfNull(items);

    var orderItems = items.ToList();

    if (orderItems.Count == 0)
      throw new ArgumentException("O pedido deve possuir pelo menos um item.", nameof(items));

    if (discountPercentage < 0 || discountPercentage > MaximumDiscountPercentage)
      throw new ArgumentOutOfRangeException(nameof(discountPercentage), $"O desconto deve estar entre 0 e {MaximumDiscountPercentage}%.");

    if (idempotencyKey == Guid.Empty)
      throw new ArgumentException("A chave de idempotência é obrigatória.", nameof(idempotencyKey));

    if (string.IsNullOrWhiteSpace(requestHash))
      throw new ArgumentException("O hash da requisição é obrigatório.", nameof(requestHash));
    
    if (requestHash.Length != 64)
      throw new ArgumentException("O hash da requisição deve possuir 64 caracteres.", nameof(requestHash));
    
    _items.AddRange(orderItems);

    Status = OrderStatus.Pending;
    CreatedAt = DateTime.UtcNow;

    DiscountPercentage = discountPercentage;

    IdempotencyKey = idempotencyKey;
    RequestHash = requestHash;

    CalculateValues();
  }

  public int Id { get; private set; }

  public DateTime CreatedAt { get; private set; }

  public OrderStatus Status { get; private set; }

  public decimal ProductsValue { get; private set; }

  public decimal DiscountPercentage { get; private set; }

  public decimal DiscountValue { get; private set; }

  public decimal TotalValue { get; private set; }

  public Guid IdempotencyKey { get; private set; }

  public string RequestHash { get; private set; } = string.Empty;

  public byte[] RowVersion { get; private set; } = [];

  public IReadOnlyCollection<OrderItem> Items => _items;

  public bool CanTransitionTo(OrderStatus newStatus)
  {
    return Status switch
    {
      OrderStatus.Pending => newStatus is OrderStatus.Processing or OrderStatus.Cancelled,
      OrderStatus.Processing => newStatus is OrderStatus.Completed or OrderStatus.Cancelled,
      _ => false
    };
  }

  public bool TransitionTo(OrderStatus newStatus)
  {
    if (!CanTransitionTo(newStatus))
      return false;

    Status = newStatus;

    return true;
  }

  private void CalculateValues()
  {
    ProductsValue = _items.Sum(item => item.Total);

    DiscountValue = decimal.Round(ProductsValue * DiscountPercentage / 100m, 2, MidpointRounding.AwayFromZero);

    TotalValue = ProductsValue - DiscountValue;
  }
}
using Domain.Entities;
using Domain.Enums;

namespace StockSys.Tests.Domain.Entities;

public sealed class OrderTests
{
  private static readonly string RequestHash = new('A', 64);

  [Fact]
  public void Constructor_ShouldCreatePendingOrder()
  {
    var order = CreateOrder();

    Assert.Equal(OrderStatus.Pending, order.Status);
    Assert.NotEqual(default, order.CreatedAt);
  }

  [Fact]
  public void Constructor_ShouldCalculateValuesWithoutDiscount()
  {
    var items = new[]
    {
      new OrderItem(1, "Mouse", 2, 100m),
      new OrderItem(2, "Teclado", 1, 50m)
    };

    var order = new Order(items, discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash);

    Assert.Equal(250m, order.ProductsValue);
    Assert.Equal(0m, order.DiscountValue);
    Assert.Equal(250m, order.TotalValue);
  }

  [Fact]
  public void Constructor_ShouldCalculateDiscount()
  {
    var items = new[]
    {
      new OrderItem(1, "Mouse", 2, 100m),
      new OrderItem(2, "Teclado", 1, 50m)
    };

    var order = new Order(items, discountPercentage: 10, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash);

    Assert.Equal(250m, order.ProductsValue);
    Assert.Equal(10m, order.DiscountPercentage);
    Assert.Equal(25m, order.DiscountValue);
    Assert.Equal(225m, order.TotalValue);
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenOrderHasNoItems()
  {
    Assert.Throws<ArgumentException>(() => new Order([], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash));
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenDiscountIsNegative()
  {
    Assert.Throws<ArgumentOutOfRangeException>(() => new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: -1, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash));
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenDiscountIsGreaterThan20()
  {
    Assert.Throws<ArgumentOutOfRangeException>(() => new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: 21, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash));
  }

  [Fact]
  public void Constructor_ShouldSetIdempotencyData()
  {
    var idempotencyKey = Guid.NewGuid();

    var order = new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: 0, idempotencyKey: idempotencyKey, requestHash: RequestHash);

    Assert.Equal(idempotencyKey, order.IdempotencyKey);
    Assert.Equal(RequestHash, order.RequestHash);
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenIdempotencyKeyIsEmpty()
  {
    Assert.Throws<ArgumentException>(() => new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: 0, idempotencyKey: Guid.Empty, requestHash: RequestHash));
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenRequestHashIsEmpty()
  {
    Assert.Throws<ArgumentException>(() => new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: string.Empty));
  }

  [Theory]
  [InlineData(OrderStatus.Processing)]
  [InlineData(OrderStatus.Cancelled)]
  public void Pending_ShouldAllowValidTransitions(OrderStatus newStatus)
  {
    var order = CreateOrder();

    var result = order.TransitionTo(newStatus);

    Assert.True(result);
    Assert.Equal(newStatus, order.Status);
  }

  [Fact]
  public void Pending_ShouldNotTransitionDirectlyToCompleted()
  {
    var order = CreateOrder();

    var result = order.TransitionTo(OrderStatus.Completed);

    Assert.False(result);
    Assert.Equal(OrderStatus.Pending, order.Status);
  }

  [Fact]
  public void Processing_ShouldTransitionToCompleted()
  {
    var order = CreateOrder();

    order.TransitionTo(OrderStatus.Processing);

    var result = order.TransitionTo(OrderStatus.Completed);

    Assert.True(result);
    Assert.Equal(OrderStatus.Completed, order.Status);
  }

  [Fact]
  public void Processing_ShouldTransitionToCancelled()
  {
    var order = CreateOrder();

    order.TransitionTo(OrderStatus.Processing);

    var result = order.TransitionTo(OrderStatus.Cancelled);

    Assert.True(result);
    Assert.Equal(OrderStatus.Cancelled, order.Status);
  }

  [Fact]
  public void Completed_ShouldBeFinalState()
  {
    var order = CreateOrder();

    order.TransitionTo(OrderStatus.Processing);
    order.TransitionTo(OrderStatus.Completed);

    var result = order.TransitionTo(OrderStatus.Cancelled);

    Assert.False(result);
    Assert.Equal(OrderStatus.Completed, order.Status);
  }

  [Fact]
  public void Cancelled_ShouldBeFinalState()
  {
    var order = CreateOrder();

    order.TransitionTo(OrderStatus.Cancelled);

    var result = order.TransitionTo(OrderStatus.Processing);

    Assert.False(result);
    Assert.Equal(OrderStatus.Cancelled, order.Status);
  }

  private static Order CreateOrder()
  {
    return new Order([new OrderItem(1, "Mouse", 1, 100m)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: RequestHash);
  }
}
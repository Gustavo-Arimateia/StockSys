using Domain.Entities;

namespace StockSys.Tests.Domain.Entities;

public sealed class OrderItemTests
{
  [Fact]
  public void Constructor_ShouldCalculateTotal()
  {
    var item = new OrderItem(productId: 1, productName: "Mouse", quantity: 3, unitPrice: 100m);

    Assert.Equal(300m, item.Total);
  }

  [Fact]
  public void Constructor_ShouldPreserveProductSnapshot()
  {
    var item = new OrderItem(productId: 10, productName: "  Mouse Gamer  ", quantity: 2, unitPrice: 199.90m);

    Assert.Equal(10, item.ProductId);
    Assert.Equal("Mouse Gamer", item.ProductName);
    Assert.Equal(199.90m, item.UnitPrice);
    Assert.Equal(2, item.Quantity);
    Assert.Equal(399.80m, item.Total);
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenQuantityIsZero()
  {
    Assert.Throws<ArgumentOutOfRangeException>(() => new OrderItem(1, "Mouse", 0, 100m));
  }

  [Fact]
  public void Constructor_ShouldThrow_WhenUnitPriceIsZero()
  {
    Assert.Throws<ArgumentOutOfRangeException>(() => new OrderItem(1, "Mouse", 1, 0));
  }
}
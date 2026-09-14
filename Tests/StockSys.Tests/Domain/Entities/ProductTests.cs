using Domain.Entities;

namespace StockSys.Tests.Domain.Entities;

public sealed class ProductTests
{
  [Fact]
  public void Constructor_ShouldCreateActiveProduct()
  {
    var product = new Product("Mouse Gamer", "Mouse com iluminação RGB", 199.90m, 10);

    Assert.Equal("Mouse Gamer", product.Name);
    Assert.Equal("Mouse com iluminação RGB", product.Description);
    Assert.Equal(199.90m, product.Price);
    Assert.Equal(10, product.StockQuantity);
    Assert.True(product.IsActive);
    Assert.NotEqual(default, product.CreatedAt);
  }

  [Fact]
  public void Constructor_ShouldTrimNameAndDescription()
  {
    var product = new Product("   Mouse Gamer   ", "   Mouse RGB   ", 199.90m, 10);

    Assert.Equal("Mouse Gamer", product.Name);
    Assert.Equal("Mouse RGB", product.Description);
  }

  [Fact]
  public void Update_ShouldUpdateProductData()
  {
    var product = new Product("Mouse", "Mouse comum", 100m, 5);

    var createdAt = product.CreatedAt;

    product.Update("Mouse Gamer", "Mouse gamer RGB", 200m, 10);

    Assert.Equal("Mouse Gamer", product.Name);
    Assert.Equal("Mouse gamer RGB", product.Description);
    Assert.Equal(200m, product.Price);
    Assert.Equal(10, product.StockQuantity);

    Assert.Equal(createdAt, product.CreatedAt);
    Assert.True(product.IsActive);
  }

  [Fact]
  public void Deactivate_ShouldSetProductAsInactive()
  {
    var product = new Product("Mouse", "Mouse", 100m, 5);

    product.Deactivate();

    Assert.False(product.IsActive);
  }

  [Fact]
  public void Activate_ShouldSetProductAsActive()
  {
    var product = new Product("Mouse", "Mouse", 100m, 5);

    product.Deactivate();
    product.Activate();

    Assert.True(product.IsActive);
  }

    [Fact]
    public void TryDecreaseStock_ShouldDecreaseStock_WhenQuantityIsAvailable()
    {
        var product = new Product("Mouse", "Mouse Gamer", 100m, 10);

        var result = product.TryDecreaseStock(3);

        Assert.True(result);
        Assert.Equal(7, product.StockQuantity);
    }

    [Fact]
    public void TryDecreaseStock_ShouldNotChangeStock_WhenQuantityIsUnavailable()
    {
        var product = new Product("Mouse", "Mouse Gamer", 100m, 2);

        var result = product.TryDecreaseStock(3);

        Assert.False(result);
        Assert.Equal(2, product.StockQuantity);
    }
}
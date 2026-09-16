using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using StockSys.Tests.Integration.Infrastructure;

namespace StockSys.Tests.Integration.Orders;

[Collection("SqlServer")]
public sealed class OrderStatusConcurrencyTests(SqlServerFixture fixture)
{
  private readonly SqlServerFixture _fixture = fixture;

  [Fact]
  public async Task SaveChangesAsync_ShouldRollbackStock_WhenOrderStatusWasChangedByAnotherContext()
  {
    await _fixture.ResetDatabaseAsync();

    int orderId;
    int productId;
    Product product;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      product = new Product("Mouse", "Mouse Gamer", 100m, 10);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      product.TryDecreaseStock(3);

      var order = new Order([new OrderItem(product.Id, product.Name, 3, product.Price)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: new string('A', 64));

      var repository = new OrderRepository(seedContext);

      await repository.CreateAsync(order);

      orderId = order.Id;
      productId = product.Id;
    }

    await using var processingContext = _fixture.CreateDbContext();

    await using var cancellationContext = _fixture.CreateDbContext();

    var processingRepository = new OrderRepository(processingContext);

    var cancellationRepository = new OrderRepository(cancellationContext);

    var cancellationProductRepository = new ProductRepository(cancellationContext);

    var processingOrder = await processingRepository.GetForUpdateAsync(orderId);

    var cancellationOrder = await cancellationRepository.GetForUpdateAsync(orderId);

    Assert.NotNull(processingOrder);
    Assert.NotNull(cancellationOrder);

    Assert.True(processingOrder!.TransitionTo(OrderStatus.Processing));
    Assert.True(cancellationOrder!.CanTransitionTo(OrderStatus.Cancelled));

    var products = await cancellationProductRepository.GetByIdsForUpdateAsync([.. cancellationOrder.Items.Select(item => item.ProductId)]);

    product = Assert.Single(products);

    product.IncreaseStock(3);

    Assert.True(cancellationOrder.TransitionTo(OrderStatus.Cancelled));

    await processingRepository.SaveChangesAsync();

    var exception = await Assert.ThrowsAsync<ConflictException>(() => cancellationRepository.SaveChangesAsync());

    Assert.Equal(ErrorCodes.ConcurrencyConflict, exception.Code);

    await using var verificationContext = _fixture.CreateDbContext();

    var persistedOrder = await verificationContext.Orders.AsNoTracking().SingleAsync(order => order.Id == orderId);

    var persistedProduct = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    Assert.Equal(OrderStatus.Processing, persistedOrder.Status);
    Assert.Equal(7, persistedProduct.StockQuantity);
  }
}
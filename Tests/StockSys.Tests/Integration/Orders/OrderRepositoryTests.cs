using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using StockSys.Tests.Integration.Infrastructure;

namespace StockSys.Tests.Integration.Orders;

[Collection("SqlServer")]
public sealed class OrderRepositoryTests(SqlServerFixture fixture)
{
  private readonly SqlServerFixture _fixture = fixture;

  [Fact]
  public async Task CreateAsync_ShouldRejectSecondOrder_WhenStockWasChangedByAnotherContext()
  {
    await _fixture.ResetDatabaseAsync();

    int productId;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      var product = new Product("Mouse", "Mouse Gamer", 100m, 1);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      productId = product.Id;
    }

    await using var firstContext = _fixture.CreateDbContext();

    await using var secondContext = _fixture.CreateDbContext();

    var firstProduct = await firstContext.Products.SingleAsync(product => product.Id == productId);

    var secondProduct = await secondContext.Products.SingleAsync(product => product.Id == productId);

    Assert.True(firstProduct.TryDecreaseStock(1));

    Assert.True(secondProduct.TryDecreaseStock(1));

    var firstOrder = new Order([new OrderItem(firstProduct.Id, firstProduct.Name, 1, firstProduct.Price)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: new string('A', 64));

    var secondOrder = new Order([new OrderItem(secondProduct.Id, secondProduct.Name, 1, secondProduct.Price)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: new string('B', 64));

    var firstRepository = new OrderRepository(firstContext);

    var secondRepository = new OrderRepository(secondContext);

    await firstRepository.CreateAsync(firstOrder);

    var exception = await Assert.ThrowsAsync<ConflictException>(() => secondRepository.CreateAsync(secondOrder));

    Assert.Equal(ErrorCodes.ConcurrencyConflict, exception.Code);

    await using var verificationContext = _fixture.CreateDbContext();

    var productAfterConcurrency = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var ordersCount = await verificationContext.Orders.CountAsync();

    var orderItemsCount = await verificationContext.OrderItems.CountAsync();

    Assert.Equal(0, productAfterConcurrency.StockQuantity);
    Assert.Equal(1, ordersCount);
    Assert.Equal(1, orderItemsCount);
  }

  [Fact]
  public async Task CreateAsync_ShouldRollbackOrderAndStock_WhenPersistenceFails()
  {
    await _fixture.ResetDatabaseAsync();

    int productId;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      var product = new Product( "Mouse", "Mouse Gamer", 100m, 5);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      productId = product.Id;
    }

    await using (var dbContext = _fixture.CreateDbContext())
    {
      var product = await dbContext.Products.SingleAsync(product => product.Id == productId);

      product.TryDecreaseStock(1);

      var invalidOrder = new Order([new OrderItem(999999, "Produto inexistente", 1, 100m)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: new string('C', 64));

      var repository = new OrderRepository(dbContext);

      await Assert.ThrowsAsync<DbUpdateException>(() => repository.CreateAsync(invalidOrder));
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var productAfterFailure = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var ordersCount = await verificationContext.Orders.CountAsync();

    var orderItemsCount = await verificationContext.OrderItems.CountAsync();

    Assert.Equal(5, productAfterFailure.StockQuantity);
    Assert.Equal(0,  ordersCount);
    Assert.Equal(0, orderItemsCount);
  }


  [Fact]
  public async Task GetPagedAsync_ShouldIncludeOrdersFromEntireEndDate()
  {
    await _fixture.ResetDatabaseAsync();

    int orderId;
    DateTime endDate;

    await using (var dbContext = _fixture.CreateDbContext())
    {
      var product = new Product("Teclado", "Teclado mecânico", 250m, 5);

      dbContext.Products.Add(product);
      await dbContext.SaveChangesAsync();

      Assert.True(product.TryDecreaseStock(1));

      var order = new Order(
        [new OrderItem(product.Id, product.Name, 1, product.Price)],
        discountPercentage: 0,
        idempotencyKey: Guid.NewGuid(),
        requestHash: new string('D', 64));

      var repository = new OrderRepository(dbContext);

      await repository.CreateAsync(order);

      orderId = order.Id;
      endDate = order.CreatedAt.Date;
    }

    await using var queryContext = _fixture.CreateDbContext();

    var queryRepository = new OrderRepository(queryContext);

    var result = await queryRepository.GetPagedAsync(
      page: 1,
      pageSize: 10,
      status: null,
      startDate: null,
      endDate: endDate,
      sortBy: "createdAt",
      sortDirection: "desc");

    Assert.Contains(result.Items, order => order.Id == orderId);
  }

  [Fact]
  public async Task CreateAsync_ShouldPreventDuplicateOrder_WhenIdempotencyKeyIsRepeated()
  {
    await _fixture.ResetDatabaseAsync();

    int productId;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      var product = new Product("Mouse", "Mouse Gamer", 100m, 1);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      productId = product.Id;
    }

    var idempotencyKey = Guid.NewGuid();
    var requestHash = new string('A', 64);

    await using var firstContext = _fixture.CreateDbContext();

    await using var secondContext = _fixture.CreateDbContext();

    var firstProduct = await firstContext.Products.SingleAsync(product => product.Id == productId);

    var secondProduct = await secondContext.Products.SingleAsync(product => product.Id == productId);

    Assert.True(firstProduct.TryDecreaseStock(1));

    Assert.True(secondProduct.TryDecreaseStock(1));

    var firstOrder = new Order([new OrderItem(firstProduct.Id, firstProduct.Name, 1, firstProduct.Price)], 0, idempotencyKey, requestHash);

    var secondOrder = new Order([new OrderItem(secondProduct.Id, secondProduct.Name, 1, secondProduct.Price)], 0, idempotencyKey, requestHash);

    var firstRepository = new OrderRepository(firstContext);

    var secondRepository = new OrderRepository(secondContext);

    await firstRepository.CreateAsync(firstOrder);

    await Assert.ThrowsAsync<ConflictException>(() => secondRepository.CreateAsync(secondOrder));

    await using var verificationContext = _fixture.CreateDbContext();

    var ordersCount = await verificationContext.Orders.CountAsync();

    var orderItemsCount = await verificationContext.OrderItems.CountAsync();

    var productAfterRequests = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    Assert.Equal(1, ordersCount);
    Assert.Equal(1, orderItemsCount);
    Assert.Equal(0, productAfterRequests.StockQuantity);
  }
}
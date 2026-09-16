using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Commands.ChangeStatus;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using StockSys.Tests.Integration.Infrastructure;

namespace StockSys.Tests.Integration.Orders;

[Collection("SqlServer")]
public sealed class ChangeOrderStatusCommandHandlerTests(SqlServerFixture fixture)
{
  private readonly SqlServerFixture _fixture = fixture;

  [Fact]
  public async Task Handle_ShouldRestoreStock_WhenPendingOrderIsCancelled()
  {
    await _fixture.ResetDatabaseAsync();

    var (orderId, productId) = await CreatePendingOrderAsync(initialStock: 10, quantity: 3);

    await using (var dbContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(dbContext);

      var response = await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Cancelled
        },
        CancellationToken.None);

      Assert.Equal(OrderStatus.Cancelled, response.Status);
      Assert.Single(response.Items);
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var product = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var order = await verificationContext.Orders.AsNoTracking().SingleAsync(order => order.Id == orderId);

    Assert.Equal(10, product.StockQuantity);

    Assert.Equal(OrderStatus.Cancelled, order.Status);
  }

  [Fact]
  public async Task Handle_ShouldRestoreStock_WhenProcessingOrderIsCancelled()
  {
    await _fixture.ResetDatabaseAsync();

    var (orderId, productId) = await CreatePendingOrderAsync(initialStock: 10, quantity: 3);

    await using (var processingContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(processingContext);

      await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Processing
        },
        CancellationToken.None);
    }

    await using (var cancellationContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(cancellationContext);

      await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Cancelled
        },
        CancellationToken.None);
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var product = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var order = await verificationContext.Orders.AsNoTracking().SingleAsync(order => order.Id == orderId);

    Assert.Equal(10, product.StockQuantity);
    Assert.Equal(OrderStatus.Cancelled, order.Status);
  }

  [Fact]
  public async Task Handle_ShouldNotRestoreStockTwice_WhenOrderIsAlreadyCancelled()
  {
    await _fixture.ResetDatabaseAsync();

    var (orderId, productId) = await CreatePendingOrderAsync(initialStock: 10, quantity: 3);

    await using (var firstContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(firstContext);

      await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Cancelled
        },
        CancellationToken.None);
    }

    await using (var secondContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(secondContext);

      var exception = await Assert.ThrowsAsync<BusinessRuleException>(() => handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Cancelled
        },
        CancellationToken.None));

      Assert.Equal(ErrorCodes.InvalidOrderStatusTransition, exception.Code);
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var product = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var order = await verificationContext.Orders.AsNoTracking().SingleAsync(order => order.Id == orderId);

    Assert.Equal(10, product.StockQuantity);

    Assert.Equal(OrderStatus.Cancelled, order.Status);
  }

  [Fact]
  public async Task Handle_ShouldRejectCancellation_WhenOrderIsCompleted()
  {
    await _fixture.ResetDatabaseAsync();

    var (orderId, productId) = await CreatePendingOrderAsync(initialStock: 10, quantity: 3);

    await using (var processingContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(processingContext);

      await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Processing
        },
        CancellationToken.None);
    }

    await using (var completedContext =  _fixture.CreateDbContext())
    {
      var handler = CreateHandler(completedContext);

      await handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Completed
        },
        CancellationToken.None);
    }

    await using (var cancellationContext = _fixture.CreateDbContext())
    {
      var handler = CreateHandler(cancellationContext);

      var exception = await Assert.ThrowsAsync<BusinessRuleException>(() => handler.Handle(
        new ChangeOrderStatusCommand
        {
          Id = orderId,
          Status = OrderStatus.Cancelled
        },
        CancellationToken.None));

      Assert.Equal(ErrorCodes.InvalidOrderStatusTransition, exception.Code);
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var product = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var order = await verificationContext.Orders.AsNoTracking().SingleAsync(order => order.Id == orderId);

    Assert.Equal(7, product.StockQuantity);
    Assert.Equal(OrderStatus.Completed, order.Status);
  }

  private async Task<(int OrderId, int ProductId)>CreatePendingOrderAsync(int initialStock, int quantity)
  {
    await using var dbContext = _fixture.CreateDbContext();

    var product = new Product("Mouse", "Mouse Gamer", 100m, initialStock);

    dbContext.Products.Add(product);

    await dbContext.SaveChangesAsync();

    Assert.True(product.TryDecreaseStock(quantity));

    var order = new Order([new OrderItem(product.Id, product.Name, quantity, product.Price)], discountPercentage: 0, idempotencyKey: Guid.NewGuid(), requestHash: new string('A', 64));

    var repository = new OrderRepository(dbContext);

    await repository.CreateAsync(order);

    return (order.Id, product.Id);
  }

  private static ChangeOrderStatusCommandHandler CreateHandler(StockSysDbContext dbContext)
  {
    return new ChangeOrderStatusCommandHandler(new OrderRepository(dbContext), new ProductRepository(dbContext));
  }
}
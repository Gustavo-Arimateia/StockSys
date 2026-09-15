using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Commands.Create;
using Application.Features.Orders.Common;
using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using StockSys.Tests.Integration.Infrastructure;

namespace StockSys.Tests.Integration.Orders;

[Collection("SqlServer")]
public sealed class CreateOrderCommandHandlerTests(SqlServerFixture fixture)
{
  private readonly SqlServerFixture _fixture = fixture;

  [Fact]
  public async Task Handle_ShouldReturnExistingOrder_WhenSameRequestIsRepeated()
  {
    await _fixture.ResetDatabaseAsync();

    int productId;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      var product = new Product("Mouse", "Mouse Gamer", 100m, 5);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      productId = product.Id;
    }

    var idempotencyKey = Guid.NewGuid();

    var command = new CreateOrderCommand
    {
      IdempotencyKey = idempotencyKey,
      Items =[new CreateOrderItemCommand(ProductId: productId, Quantity: 2)],
      DiscountPercentage = 10
    };

    OrderResponse firstResponse;

    await using (var firstContext = _fixture.CreateDbContext())
    {
      var handler = new CreateOrderCommandHandler(new ProductRepository(firstContext), new OrderRepository(firstContext));

      firstResponse = await handler.Handle(command, CancellationToken.None);
    }

    OrderResponse secondResponse;

    await using (var secondContext = _fixture.CreateDbContext())
    {
      var handler = new CreateOrderCommandHandler(
        new ProductRepository(secondContext),
        new OrderRepository(secondContext));

      secondResponse = await handler.Handle(command, CancellationToken.None);
    }

    Assert.Equal(firstResponse.Id, secondResponse.Id);
    Assert.Equal(firstResponse.ProductsValue, secondResponse.ProductsValue);
    Assert.Equal(firstResponse.DiscountValue, secondResponse.DiscountValue);
    Assert.Equal(firstResponse.TotalValue, secondResponse.TotalValue);

    await using var verificationContext = _fixture.CreateDbContext();

    var productAfterReplay = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var ordersCount = await verificationContext.Orders.CountAsync();

    var orderItemsCount = await verificationContext.OrderItems.CountAsync();

    Assert.Equal(3, productAfterReplay.StockQuantity);
    Assert.Equal(1, ordersCount);
    Assert.Equal(1, orderItemsCount);
  }

  [Fact]
  public async Task Handle_ShouldReject_WhenIdempotencyKeyIsReusedWithDifferentPayload()
  {
    await _fixture.ResetDatabaseAsync();

    int productId;

    await using (var seedContext = _fixture.CreateDbContext())
    {
      var product = new Product("Mouse", "Mouse Gamer", 100m, 5);

      seedContext.Products.Add(product);

      await seedContext.SaveChangesAsync();

      productId = product.Id;
    }

    var idempotencyKey = Guid.NewGuid();

    var firstCommand = new CreateOrderCommand
    {
      IdempotencyKey = idempotencyKey,
      Items =[new CreateOrderItemCommand(ProductId: productId, Quantity: 1)],
      DiscountPercentage = 0
    };

    await using (var firstContext = _fixture.CreateDbContext())
    {
      var handler = new CreateOrderCommandHandler(new ProductRepository(firstContext), new OrderRepository(firstContext));

      await handler.Handle(firstCommand, CancellationToken.None);
    }

    var secondCommand = new CreateOrderCommand
    {
      IdempotencyKey = idempotencyKey,
      Items =[new CreateOrderItemCommand(ProductId: productId, Quantity: 2)],
      DiscountPercentage = 0
    };

    await using (var secondContext = _fixture.CreateDbContext())
    {
      var handler = new CreateOrderCommandHandler(new ProductRepository(secondContext), new OrderRepository(secondContext));

      var exception = await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(secondCommand, CancellationToken.None));

      Assert.Equal(ErrorCodes.IdempotencyKeyReused, exception.Code);
    }

    await using var verificationContext = _fixture.CreateDbContext();

    var productAfterRejectedReplay = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

    var ordersCount = await verificationContext.Orders.CountAsync();

    var orderItemsCount = await verificationContext.OrderItems.CountAsync();

    Assert.Equal(4, productAfterRejectedReplay.StockQuantity);
    Assert.Equal(1, ordersCount);
    Assert.Equal(1, orderItemsCount);
  }
}
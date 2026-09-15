using Application.Features.Orders.Commands.Create;

namespace StockSys.Tests.Application.Orders;

public sealed class OrderRequestHasherTests
{
  [Fact]
  public void Compute_ShouldReturnSameHash_WhenItemsHaveDifferentOrder()
  {
    var firstCommand = new CreateOrderCommand
    {
      IdempotencyKey = Guid.NewGuid(),
      Items =[new CreateOrderItemCommand(1, 2), new CreateOrderItemCommand(2, 1)],
      DiscountPercentage = 10
    };

    var secondCommand = new CreateOrderCommand
    {
      IdempotencyKey = Guid.NewGuid(),
      Items =[new CreateOrderItemCommand(2, 1), new CreateOrderItemCommand(1, 2)],
      DiscountPercentage = 10
    };

    var firstHash = OrderRequestHasher.Compute(firstCommand);

    var secondHash = OrderRequestHasher.Compute(secondCommand);

    Assert.Equal(firstHash, secondHash);
  }

  [Fact]
  public void Compute_ShouldReturnDifferentHash_WhenQuantityChanges()
  {
    var firstCommand = new CreateOrderCommand
    {
      Items =[new CreateOrderItemCommand(1, 1)],
      DiscountPercentage = 10
    };

    var secondCommand = firstCommand with
    {
      Items =[new CreateOrderItemCommand(1, 2)]
    };

    Assert.NotEqual(OrderRequestHasher.Compute(firstCommand), OrderRequestHasher.Compute(secondCommand));
  }

  [Fact]
  public void Compute_ShouldReturnDifferentHash_WhenDiscountChanges()
  {
    var firstCommand = new CreateOrderCommand
    {
      Items =[new CreateOrderItemCommand(1, 1)],
      DiscountPercentage = 5
    };

    var secondCommand = firstCommand with
    {
      DiscountPercentage = 10
    };

    Assert.NotEqual(OrderRequestHasher.Compute(firstCommand), OrderRequestHasher.Compute(secondCommand));
  }
}
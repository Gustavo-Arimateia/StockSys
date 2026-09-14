using Application.Features.Orders.Commands.Create;

namespace StockSys.Tests.Application.Orders;

public sealed class CreateOrderCommandValidatorTests
{
  private readonly CreateOrderCommandValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenOrderHasNoItems()
  {
    var command = new CreateOrderCommand([], 0);

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenQuantityIsZero()
  {
    var command = new CreateOrderCommand([new CreateOrderItemCommand(ProductId: 1, Quantity: 0)], 0);

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenProductIdIsInvalid()
  {
    var command = new CreateOrderCommand([new CreateOrderItemCommand(ProductId: 0, Quantity: 1)], 0);

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenDiscountIsGreaterThan20()
  {
    var command = new CreateOrderCommand([new CreateOrderItemCommand(ProductId: 1, Quantity: 1)], 21);

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenProductIsDuplicated()
  {
    var command = new CreateOrderCommand([new CreateOrderItemCommand(ProductId: 1, Quantity: 1), new CreateOrderItemCommand(ProductId: 1, Quantity: 2)], 0);

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenCommandIsValid()
  {
    var command = new CreateOrderCommand([new CreateOrderItemCommand(ProductId: 1, Quantity: 2), new CreateOrderItemCommand(ProductId: 2, Quantity: 1)], 10);

    var result = _validator.Validate(command);

    Assert.True(result.IsValid);
  }
}
using Application.Features.Orders.Commands.Create;

namespace StockSys.Tests.Application.Orders;

public sealed class CreateOrderCommandValidatorTests
{
  private readonly CreateOrderCommandValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenOrderHasNoItems()
  {
    var command = CreateValidCommand() with
    {
      Items = []
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenQuantityIsZero()
  {
    var command = CreateValidCommand() with
    {
      Items =[new CreateOrderItemCommand( ProductId: 1, Quantity: 0)]
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenProductIdIsInvalid()
  {
    var command = CreateValidCommand() with
    {
      Items = [new CreateOrderItemCommand(ProductId: 0, Quantity: 1)]
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenDiscountIsGreaterThan20()
  {
    var command = CreateValidCommand() with
    {
      DiscountPercentage = 21
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenProductIsDuplicated()
  {
    var command = CreateValidCommand() with
    {
      Items =[new CreateOrderItemCommand(ProductId: 1, Quantity: 1), new CreateOrderItemCommand(ProductId: 1,Quantity: 2)]
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenIdempotencyKeyIsEmpty()
  {
    var command = CreateValidCommand() with
    {
      IdempotencyKey = Guid.Empty
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenCommandIsValid()
  {
    var command = CreateValidCommand();

    var result = _validator.Validate(command);

    Assert.True(result.IsValid);
  }

  private static CreateOrderCommand CreateValidCommand()
  {
    return new CreateOrderCommand
    {
      IdempotencyKey = Guid.NewGuid(),

      Items = [new CreateOrderItemCommand(ProductId: 1, Quantity: 2), new CreateOrderItemCommand(ProductId: 2, Quantity: 1)],

      DiscountPercentage = 10
    };
  }
}
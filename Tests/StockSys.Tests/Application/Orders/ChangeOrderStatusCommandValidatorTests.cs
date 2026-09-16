using Application.Features.Orders.Commands.ChangeStatus;
using Domain.Enums;

namespace StockSys.Tests.Application.Orders;

public sealed class ChangeOrderStatusCommandValidatorTests
{
  private readonly ChangeOrderStatusCommandValidator _validator =
    new();

  [Fact]
  public void Validate_ShouldFail_WhenIdIsZero()
  {
    var command = new ChangeOrderStatusCommand
    {
      Id = 0,
      Status = OrderStatus.Processing
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenStatusIsInvalid()
  {
    var command = new ChangeOrderStatusCommand
    {
      Id = 1,
      Status = (OrderStatus)99
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenCommandIsValid()
  {
    var command = new ChangeOrderStatusCommand
    {
      Id = 1,
      Status = OrderStatus.Processing
    };

    var result = _validator.Validate(command);

    Assert.True(result.IsValid);
  }
}
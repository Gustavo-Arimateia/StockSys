using Application.Features.Orders.Queries.GetById;

namespace StockSys.Tests.Application.Orders;

public sealed class GetOrderByIdQueryValidatorTests
{
  private readonly GetOrderByIdQueryValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenIdIsZero()
  {
    var query = new GetOrderByIdQuery(0);

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenIdIsValid()
  {
    var query = new GetOrderByIdQuery(1);

    var result = _validator.Validate(query);

    Assert.True(result.IsValid);
  }
}
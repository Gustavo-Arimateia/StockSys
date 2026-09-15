using Application.Features.Orders.Queries.GetAll;

namespace StockSys.Tests.Application.Orders;

public sealed class GetOrdersQueryValidatorTests
{
  private readonly GetOrdersQueryValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenPageIsZero()
  {
    var query = new GetOrdersQuery(Page: 0);

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenPageSizeIsGreaterThan100()
  {
    var query = new GetOrdersQuery(PageSize: 101);

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenSortFieldIsInvalid()
  {
    var query = new GetOrdersQuery(SortBy: "invalid");

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenStartDateIsGreaterThanEndDate()
  {
    var query = new GetOrdersQuery(StartDate: new DateTime(2026, 9, 30), EndDate: new DateTime(2026, 9, 1));

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenQueryIsValid()
  {
    var query = new GetOrdersQuery(Page: 1, PageSize: 20, SortBy: "totalValue", SortDirection: "desc");

    var result = _validator.Validate(query);

    Assert.True(result.IsValid);
  }
}
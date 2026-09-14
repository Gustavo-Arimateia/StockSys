using Application.Features.Products.Queries.GetAll;

namespace StockSys.Tests.Application.Products;

public sealed class GetProductsQueryValidatorTests
{
  private readonly GetProductsQueryValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenPageIsZero()
  {
    var query = new GetProductsQuery(Page: 0);

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenPageSizeIsGreaterThan100()
  {
    var query = new GetProductsQuery(PageSize: 101);

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenSortFieldIsInvalid()
  {
    var query = new GetProductsQuery(SortBy: "invalid");

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldFail_WhenSortDirectionIsInvalid()
  {
    var query = new GetProductsQuery(SortDirection: "random");

    var result = _validator.Validate(query);

    Assert.False(result.IsValid);
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenQueryIsValid()
  {
    var query = new GetProductsQuery(Page: 1, PageSize: 20, Name: "mouse", IsActive: true, SortBy: "price", SortDirection: "desc");

    var result = _validator.Validate(query);

    Assert.True(result.IsValid);
  }
}
using Application.Features.Products.Commands.Create;

namespace StockSys.Tests.Application.Products;

public sealed class CreateProductCommandValidatorTests
{
  private readonly CreateProductCommandValidator _validator = new();

  [Fact]
  public void Validate_ShouldFail_WhenNameIsEmpty()
  {
    var command = new CreateProductCommand
    {
      Name = "",
      Description = "Produto",
      Price = 100m,
      StockQuantity = 10
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
    Assert.Contains(result.Errors, error => error.PropertyName == nameof(command.Name));
  }

  [Fact]
  public void Validate_ShouldFail_WhenPriceIsZero()
  {
    var command = new CreateProductCommand
    {
      Name = "Produto",
      Description = "Produto",
      Price = 0,
      StockQuantity = 10
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
    Assert.Contains(result.Errors, error => error.PropertyName == nameof(command.Price));
  }

  [Fact]
  public void Validate_ShouldFail_WhenStockIsNegative()
  {
    var command = new CreateProductCommand
    {
      Name = "Produto",
      Description = "Produto",
      Price = 100m,
      StockQuantity = -1
    };

    var result = _validator.Validate(command);

    Assert.False(result.IsValid);
    Assert.Contains(result.Errors, error => error.PropertyName == nameof(command.StockQuantity));
  }

  [Fact]
  public void Validate_ShouldSucceed_WhenProductIsValid()
  {
    var command = new CreateProductCommand
    {
      Name = "Produto",
      Description = "Produto válido",
      Price = 100m,
      StockQuantity = 10
    };

    var result = _validator.Validate(command);

    Assert.True(result.IsValid);
  }
}
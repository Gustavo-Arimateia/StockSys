using Application.Common.Responses;
using Application.Features.Products.Common;
using MediatR;

namespace Application.Features.Products.Commands.Create;

public sealed class CreateProductCommand: IRequest<ServiceResponse<ProductResponse>>
{
  public string Name { get; init; } = string.Empty;

  public string Description { get; init; } = string.Empty;

  public decimal Price { get; init; }

  public int StockQuantity { get; init; }
}
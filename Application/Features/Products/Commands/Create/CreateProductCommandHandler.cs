using Application.Common.Responses;
using Application.Features.Products.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Commands.Create;

public sealed class CreateProductCommandHandler(IProductRepository productRepository) : IRequestHandler<CreateProductCommand, ServiceResponse<ProductResponse>>
{
  private readonly IProductRepository _productRepository = productRepository;

  public async Task<ServiceResponse<ProductResponse>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
  {
    var product = new Product(request.Name.Trim(), request.Description.Trim(), request.Price, request.StockQuantity);

    await _productRepository.AddAsync(product, cancellationToken);

    var response = new ProductResponse
    {
      Id = product.Id,
      Name = product.Name,
      Description = product.Description,
      Price = product.Price,
      StockQuantity = product.StockQuantity,
      IsActive = product.IsActive,
      CreatedAt = product.CreatedAt
    };

    return ServiceResponse<ProductResponse>.Ok(response, "Produto cadastrado com sucesso.");
  }
}
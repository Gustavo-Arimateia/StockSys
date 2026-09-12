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
    var product = new Product(request.Name, request.Description, request.Price, request.StockQuantity);

    await _productRepository.AddAsync(product, cancellationToken);

    return ServiceResponse<ProductResponse>.Ok(product.ToResponse(), "Produto cadastrado com sucesso.");
  }
}
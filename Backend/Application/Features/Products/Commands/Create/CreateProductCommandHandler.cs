using Application.Features.Products.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Commands.Create;

public sealed class CreateProductCommandHandler(IProductRepository productRepository) : IRequestHandler<CreateProductCommand, ProductResponse>
{
    private readonly IProductRepository _productRepository = productRepository;

    public async Task<ProductResponse> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product(request.Name, request.Description, request.Price, request.StockQuantity);

        await _productRepository.AddAsync(product, cancellationToken);

        return product.ToResponse();
    }
}
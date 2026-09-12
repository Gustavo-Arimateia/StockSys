using Application.Features.Products.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Commands.Update;

public sealed class UpdateProductCommandHandler(IProductRepository productRepository) : IRequestHandler<UpdateProductCommand, ProductResponse?>
{
    private readonly IProductRepository _productRepository = productRepository;

    public async Task<ProductResponse?> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetForUpdateAsync(request.Id, cancellationToken);

        if (product is null)
            return null;

        product.Update(request.Name, request.Description, request.Price, request.StockQuantity);

        await _productRepository.UpdateAsync(product, cancellationToken);

        return product.ToResponse();
    }
}
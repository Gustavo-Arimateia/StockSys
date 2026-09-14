using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Products.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Commands.ChangeStatus;

public sealed class ChangeProductStatusCommandHandler(IProductRepository productRepository) : IRequestHandler<ChangeProductStatusCommand, ProductResponse>
{
  private readonly IProductRepository _productRepository = productRepository;

  public async Task<ProductResponse> Handle(ChangeProductStatusCommand request, CancellationToken cancellationToken)
  {
    var product = await _productRepository.GetForUpdateAsync(request.Id, cancellationToken);

    if (product is null)
      throw new NotFoundException("Produto não encontrado.", ErrorCodes.ProductNotFound);

    if (request.IsActive)
      product.Activate();
    else
      product.Deactivate();

    await _productRepository.SaveChangesAsync(cancellationToken);

    return product.ToResponse();
  }
}
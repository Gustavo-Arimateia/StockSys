using Application.Features.Products.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Queries.GetById;

public sealed class GetProductByIdQueryHandler(IProductRepository productRepository) : IRequestHandler<GetProductByIdQuery, ProductResponse?>
{
  private readonly IProductRepository _productRepository = productRepository;

  public async Task<ProductResponse?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
  {
    var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);

    return product?.ToResponse();
  }
}
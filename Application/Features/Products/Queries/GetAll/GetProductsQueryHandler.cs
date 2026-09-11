using Application.Features.Products.Common;
using Domain.Interfaces.Repositories;
using Domain.Results;
using MediatR;

namespace Application.Features.Products.Queries.GetAll;

public sealed class GetProductsQueryHandler(IProductRepository productRepository) : IRequestHandler<GetProductsQuery, PagedResult<ProductResponse>>
{
  private readonly IProductRepository _productRepository = productRepository;

  public async Task<PagedResult<ProductResponse>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
  {
    var products = await _productRepository.GetPagedAsync(request.Page, request.PageSize, request.Name, request.IsActive, request.SortBy, request.SortDirection, cancellationToken);

    return new PagedResult<ProductResponse>
    {
      Items = [.. products.Items.Select(product => product.ToResponse())],
      Page = products.Page,
      PageSize = products.PageSize,
      TotalItems = products.TotalItems,
      TotalPages = products.TotalPages
    };
  }
}
using Application.Features.Products.Common;
using Domain.Results;
using MediatR;

namespace Application.Features.Products.Queries.GetAll;

public sealed record GetProductsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Name = null,
    bool? IsActive = null,
    string SortBy = "name",
    string SortDirection = "asc") : IRequest<PagedResult<ProductResponse>>;
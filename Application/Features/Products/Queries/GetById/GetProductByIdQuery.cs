using Application.Features.Products.Common;
using MediatR;

namespace Application.Features.Products.Queries.GetById;

public sealed record GetProductByIdQuery(int Id) : IRequest<ProductResponse>;
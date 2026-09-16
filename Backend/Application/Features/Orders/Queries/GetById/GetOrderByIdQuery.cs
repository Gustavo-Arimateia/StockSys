using Application.Features.Orders.Common;
using MediatR;

namespace Application.Features.Orders.Queries.GetById;

public sealed record GetOrderByIdQuery(
  int Id) : IRequest<OrderResponse>;
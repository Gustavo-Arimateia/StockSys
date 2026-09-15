using Application.Features.Orders.Common;
using Domain.Enums;
using Domain.Results;
using MediatR;

namespace Application.Features.Orders.Queries.GetAll;

public sealed record GetOrdersQuery(
  int Page = 1,
  int PageSize = 10,
  OrderStatus? Status = null,
  DateTime? StartDate = null,
  DateTime? EndDate = null,
  string SortBy = "createdAt",
  string SortDirection = "desc") : IRequest<PagedResult<OrderSummaryResponse>>;
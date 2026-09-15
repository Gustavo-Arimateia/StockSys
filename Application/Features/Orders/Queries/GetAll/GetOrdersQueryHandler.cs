using Application.Features.Orders.Common;
using Domain.Interfaces.Repositories;
using Domain.Results;
using MediatR;

namespace Application.Features.Orders.Queries.GetAll;

public sealed class GetOrdersQueryHandler(IOrderRepository orderRepository) : IRequestHandler<GetOrdersQuery, PagedResult<OrderSummaryResponse>>
{
  private readonly IOrderRepository _orderRepository = orderRepository;

  public async Task<PagedResult<OrderSummaryResponse>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
  {
    var result = await _orderRepository.GetPagedAsync(request.Page, request.PageSize, request.Status, request.StartDate, request.EndDate, request.SortBy, request.SortDirection, cancellationToken);

    return new PagedResult<OrderSummaryResponse>
    {
      Items = [.. result.Items.Select(order => order.ToSummaryResponse())],
      Page = result.Page,
      PageSize = result.PageSize,
      TotalItems = result.TotalItems,
      TotalPages = result.TotalPages
    };
  }
}
using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Orders.Queries.GetById;

public sealed class GetOrderByIdQueryHandler(IOrderRepository orderRepository) : IRequestHandler<GetOrderByIdQuery, OrderResponse>
{
  private readonly IOrderRepository _orderRepository = orderRepository;

  public async Task<OrderResponse> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
  {
    var order = await _orderRepository.GetByIdAsync(request.Id, cancellationToken);

    if (order is null)
      throw new NotFoundException("Pedido não encontrado.", ErrorCodes.OrderNotFound);
    

    return order.ToResponse();
  }
}
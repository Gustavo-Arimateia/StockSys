using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Common;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Orders.Commands.ChangeStatus;

public sealed class ChangeOrderStatusCommandHandler(IOrderRepository orderRepository) : IRequestHandler<ChangeOrderStatusCommand, OrderResponse>
{
  private readonly IOrderRepository _orderRepository = orderRepository;

  public async Task<OrderResponse> Handle(ChangeOrderStatusCommand request, CancellationToken cancellationToken)
  {
    var order = await _orderRepository.GetForUpdateAsync(request.Id, cancellationToken);

    if (order is null)
      throw new NotFoundException("Pedido não encontrado.", ErrorCodes.OrderNotFound);
    
    if (!order.TransitionTo(request.Status))
      throw new BusinessRuleException($"Não é possível alterar o pedido de '{order.Status}' para '{request.Status}'.", ErrorCodes.InvalidOrderStatusTransition);

    await _orderRepository.SaveChangesAsync(cancellationToken);

    return order.ToResponse();
  }
}
using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Common;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Orders.Commands.ChangeStatus;

public sealed class ChangeOrderStatusCommandHandler(IOrderRepository orderRepository, IProductRepository productRepository) : IRequestHandler<ChangeOrderStatusCommand, OrderResponse>
{
  private readonly IOrderRepository _orderRepository = orderRepository;
  private readonly IProductRepository _productRepository = productRepository;

  public async Task<OrderResponse> Handle(ChangeOrderStatusCommand request, CancellationToken cancellationToken)
  {
    var order = await _orderRepository.GetForUpdateAsync(request.Id, cancellationToken);

    if (order is null)
      throw new NotFoundException("Pedido não encontrado.", ErrorCodes.OrderNotFound);
    
    if (!order.CanTransitionTo(request.Status))
      throw new BusinessRuleException($"Não é possível alterar o pedido de '{order.Status}' para '{request.Status}'.", ErrorCodes.InvalidOrderStatusTransition); 

    if (request.Status == OrderStatus.Cancelled)
      await RestoreStockAsync(order, cancellationToken);
   
    order.TransitionTo(request.Status);

    await _orderRepository.SaveChangesAsync(cancellationToken);

    return order.ToResponse();
  }

  private async Task RestoreStockAsync(Domain.Entities.Order order, CancellationToken cancellationToken)
  {
    var productIds = order.Items.Select(item => item.ProductId).ToArray();

    var products = await _productRepository.GetByIdsForUpdateAsync(productIds, cancellationToken);

    if (products.Count != productIds.Length)
      throw new InvalidOperationException("Não foi possível localizar todos os produtos do pedido.");

    var productsById = products.ToDictionary(product => product.Id);

    foreach (var item in order.Items)
    {
      var product = productsById[item.ProductId];

      product.IncreaseStock(item.Quantity);
    }
  }
}
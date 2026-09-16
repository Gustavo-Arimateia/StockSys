using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Common;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Orders.Commands.Create;

public sealed class CreateOrderCommandHandler(IProductRepository productRepository, IOrderRepository orderRepository) : IRequestHandler<CreateOrderCommand, OrderResponse>
{
  private readonly IProductRepository _productRepository = productRepository;
  private readonly IOrderRepository _orderRepository = orderRepository;

  public async Task<OrderResponse> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
  {
    var requestHash = OrderRequestHasher.Compute(request);

    var existingOrder = await _orderRepository.GetByIdempotencyKeyAsync(request.IdempotencyKey, cancellationToken);

    if (existingOrder is not null)
    {
      if (!string.Equals(existingOrder.RequestHash, requestHash, StringComparison.Ordinal))
        throw new ConflictException("A chave de idempotência já foi utilizada em outra requisição.", ErrorCodes.IdempotencyKeyReused);

      return existingOrder.ToResponse();
    }

    var productIds = request.Items.Select(item => item.ProductId).ToArray();

    var products = await _productRepository.GetByIdsForUpdateAsync(productIds, cancellationToken);

    ValidateProductsExist(productIds, products);

    var productsById = products.ToDictionary(product => product.Id);

    var orderItems = new List<OrderItem>();

    foreach (var requestItem in request.Items)
    {
      var product = productsById[requestItem.ProductId];

      if (!product.IsActive)
        throw new BusinessRuleException($"O produto '{product.Name}' está inativo.", ErrorCodes.ProductInactive);

      if (!product.TryDecreaseStock(requestItem.Quantity))
        throw new BusinessRuleException($"O produto '{product.Name}' não possui estoque suficiente.", ErrorCodes.ProductOutOfStock);

      orderItems.Add(new OrderItem(product.Id, product.Name, requestItem.Quantity, product.Price));
    }

    var order = new Order(orderItems, request.DiscountPercentage, request.IdempotencyKey, requestHash);

    try
    {
      await _orderRepository.CreateAsync(order, cancellationToken);

      return order.ToResponse();
    }
    catch (ConflictException exception)
      when (exception.Code == ErrorCodes.ConcurrencyConflict ||
            exception.Code == ErrorCodes.IdempotencyKeyReused)
    {
      var concurrentOrder = await _orderRepository.GetByIdempotencyKeyAsync(request.IdempotencyKey, cancellationToken);

      if (concurrentOrder is null)
        throw;

      if (!string.Equals(concurrentOrder.RequestHash, requestHash, StringComparison.Ordinal))
        throw new ConflictException("A chave de idempotência já foi utilizada em outra requisição.", ErrorCodes.IdempotencyKeyReused);

      return concurrentOrder.ToResponse();
    }
  }

  private static void ValidateProductsExist(IReadOnlyCollection<int> productIds, IReadOnlyCollection<Product> products)
  {
    if (products.Count == productIds.Count)
      return;

    var existingIds = products.Select(product => product.Id).ToHashSet();

    var missingProductId = productIds.First(id => !existingIds.Contains(id));

    throw new NotFoundException($"Produto {missingProductId} não encontrado.", ErrorCodes.ProductNotFound);
  }
}
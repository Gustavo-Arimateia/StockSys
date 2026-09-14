using Application.Common.Errors;
using Application.Common.Exceptions;
using Application.Features.Orders.Common;
using Application.Interfaces.Repositories;
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

        var order = new Order(orderItems, request.DiscountPercentage);

        await _orderRepository.CreateAsync(order, cancellationToken);

        return order.ToResponse();
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
using Application.Features.Orders.Common;
using MediatR;

namespace Application.Features.Orders.Commands.Create;

public sealed record CreateOrderCommand(
    IReadOnlyCollection<CreateOrderItemCommand> Items,
    decimal DiscountPercentage) : IRequest<OrderResponse>;
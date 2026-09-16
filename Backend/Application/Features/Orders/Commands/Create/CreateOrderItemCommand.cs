namespace Application.Features.Orders.Commands.Create;

public sealed record CreateOrderItemCommand(
    int ProductId,
    int Quantity);
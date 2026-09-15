using System.Text.Json.Serialization;
using Application.Features.Orders.Common;
using MediatR;

namespace Application.Features.Orders.Commands.Create;

public sealed record CreateOrderCommand(IReadOnlyCollection<CreateOrderItemCommand> Items, decimal DiscountPercentage) : IRequest<OrderResponse>
{
  [JsonIgnore]
  public Guid IdempotencyKey { get; init; }
}
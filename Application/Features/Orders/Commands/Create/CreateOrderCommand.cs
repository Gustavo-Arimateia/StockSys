using System.Text.Json.Serialization;
using Application.Features.Orders.Common;
using MediatR;

namespace Application.Features.Orders.Commands.Create;

public sealed record CreateOrderCommand : IRequest<OrderResponse>
{
  [JsonIgnore]
  public Guid IdempotencyKey { get; init; }

  public IReadOnlyCollection<CreateOrderItemCommand> Items { get; init; } = [];

  public decimal DiscountPercentage { get; init; }
}
using System.Text.Json.Serialization;
using Application.Features.Orders.Common;
using Domain.Enums;
using MediatR;

namespace Application.Features.Orders.Commands.ChangeStatus;

public sealed record ChangeOrderStatusCommand : IRequest<OrderResponse>
{
  [JsonIgnore]
  public int Id { get; init; }

  public OrderStatus Status { get; init; }
}
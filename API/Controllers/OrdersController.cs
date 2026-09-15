using Application.Features.Orders.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController(IMediator mediator) : ControllerBase
{
  private readonly IMediator _mediator = mediator;

  [HttpPost]
  public async Task<IActionResult> Create([FromHeader(Name = "Idempotency-Key")] string? idempotencyKey, [FromBody] CreateOrderCommand command, CancellationToken cancellationToken)
  {
    command = command with
    {
      IdempotencyKey = Guid.TryParse(idempotencyKey, out var key) ? key : Guid.Empty
    };

    var order = await _mediator.Send(command, cancellationToken);

    return StatusCode(StatusCodes.Status201Created, order);
  }
}
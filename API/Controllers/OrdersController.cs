using Application.Features.Orders.Commands.Create;
using Application.Features.Orders.Queries.GetAll;
using Application.Features.Orders.Queries.GetById;
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

    return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
  }

  [HttpGet("{id:int}")]
  public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
  {
    var order = await _mediator.Send(new GetOrderByIdQuery(id), cancellationToken);

    return Ok(order);
  }

  [HttpGet]
  public async Task<IActionResult> GetAll([FromQuery] GetOrdersQuery query, CancellationToken cancellationToken)
  {
    var result = await _mediator.Send(query, cancellationToken);

    return Ok(result);
  }
}
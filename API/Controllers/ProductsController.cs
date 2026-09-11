using Application.Features.Products.Commands.Create;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(IMediator mediator): ControllerBase
{
  private readonly IMediator _mediator = mediator;

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
  {
    var response = await _mediator.Send(command, cancellationToken);

    return StatusCode(StatusCodes.Status201Created, response);
  }
}
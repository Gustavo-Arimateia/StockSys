using Application.Features.Products.Commands.Create;
using Application.Features.Products.Queries.GetById;
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

    return CreatedAtAction(nameof(GetById), new { id = response.Data!.Id }, response);
  }

  [HttpGet("{id:int}")]
  public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
  {
    if (id <= 0)
    {
      return BadRequest(new
      {
        message = "O identificador do produto deve ser maior que zero.",
        code = "INVALID_PRODUCT_ID"
      });
    }

    var product = await _mediator.Send(new GetProductByIdQuery(id), cancellationToken);

    if (product is null)
    {
      return NotFound(new
      {
        message = "Produto não encontrado.",
        code = "PRODUCT_NOT_FOUND"
      });
    }

    return Ok(product);
  }
}
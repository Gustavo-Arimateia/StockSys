using Application.Common.User.Create;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/users")]
[AllowAnonymous]
public sealed class UsersController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserCommand command,
        CancellationToken ct)
    {
        var response = await _mediator.Send(command, ct);

        if (!response.Success)
            return BadRequest(response);

        return StatusCode(StatusCodes.Status201Created, response);
    }
}
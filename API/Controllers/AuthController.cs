using Application.Common.Auth.Login;
using Domain.DTOs.Auth;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken ct)
    {
        var response = await _mediator.Send(
            new LoginCommand(request.Email, request.Senha),
            ct);

        if (!response.Success)
            return Unauthorized(response);

        return Ok(response);
    }
}
using Application.Common.Responses;
using Domain.DTOs.Auth;
using MediatR;

namespace Application.Common.Auth.Login;

public sealed record LoginCommand(
    string Email,
    string Senha
) : IRequest<ServiceResponse<LoginResponseDto>>;
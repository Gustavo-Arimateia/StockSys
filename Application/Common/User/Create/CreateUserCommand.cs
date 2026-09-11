using Application.Common.Responses;
using Domain.DTOs.Users;
using MediatR;

namespace Application.Common.User.Create;

public sealed class CreateUserCommand : IRequest<ServiceResponse<CreateUserResponseDto>>
{
    public string Nome { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string Senha { get; init; } = string.Empty;
}
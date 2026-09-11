using Application.Common.Responses;
using Domain.DTOs.Users;
using Domain.Entities;
using Domain.Interfaces.Auth;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Common.User.Create;

public sealed class CreateUserCommandHandler(
    IUserRepository userRepository,
    IPasswordHasherService passwordHasherService)
    : IRequestHandler<CreateUserCommand, ServiceResponse<CreateUserResponseDto>>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordHasherService _passwordHasherService = passwordHasherService;

    public async Task<ServiceResponse<CreateUserResponseDto>> Handle(
        CreateUserCommand request,
        CancellationToken ct)
    {
        string nome = request.Nome.Trim();
        string email = request.Email.Trim();

        bool emailJaExiste = await _userRepository.ExistsByEmailAsync(email, ct);

        if (emailJaExiste)
            return ServiceResponse<CreateUserResponseDto>.Fail("Já existe um usuário cadastrado com este e-mail.");

        var usuarioBase = new Usuario
        {
            Nome = nome,
            Email = email,
            SenhaHash = string.Empty,
            Ativo = true
        };

        string senhaHash = _passwordHasherService.HashPassword(usuarioBase, request.Senha);

        var usuario = new Usuario
        {
            Nome = nome,
            Email = email,
            SenhaHash = senhaHash,
            Ativo = true
        };

        Guid usuarioId = await _userRepository.CreateAsync(usuario, ct);

        return ServiceResponse<CreateUserResponseDto>.Ok(
            new CreateUserResponseDto
            {
                Id = usuarioId,
                Nome = nome,
                Email = email
            },
            "Usuário criado com sucesso."
        );
    }
}
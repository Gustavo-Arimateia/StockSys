using Application.Common.Responses;
using Domain.DTOs.Auth;
using Domain.Interfaces.Auth;
using Domain.Interfaces.Repositories;
using MediatR;

namespace Application.Common.Auth.Login;

public sealed class LoginCommandHandler(IUserRepository userRepository, IPasswordHasherService passwordHasherService, IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginCommand, ServiceResponse<LoginResponseDto>>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordHasherService _passwordHasherService = passwordHasherService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator = jwtTokenGenerator;

    public async Task<ServiceResponse<LoginResponseDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, ct);

        if (user is null)
            return ServiceResponse<LoginResponseDto>.Fail("E-mail ou senha inválidos.");

        if (!user.Ativo)
            return ServiceResponse<LoginResponseDto>.Fail("E-mail ou senha inválidos.");

        bool senhaValida = _passwordHasherService.VerifyPassword(user, request.Senha);

        if (!senhaValida)
            return ServiceResponse<LoginResponseDto>.Fail("E-mail ou senha inválidos.");

        string token = _jwtTokenGenerator.Generate(user, out DateTime expiresAt);

        await _userRepository.UpdateLastLoginAsync(user.Id, ct);

        return ServiceResponse<LoginResponseDto>.Ok(
            new LoginResponseDto
            {
                AccessToken = token,
                ExpiresAt = expiresAt,
                TokenType = "Bearer"
            },
            "Login realizado com sucesso."
        );
    }
}
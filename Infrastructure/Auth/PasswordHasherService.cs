using Domain.Entities;
using Domain.Interfaces.Auth;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Auth;

public sealed class PasswordHasherService : IPasswordHasherService
{
    private readonly PasswordHasher<Usuario> _passwordHasher = new();

    public string HashPassword(Usuario user, string senha)
    {
        return _passwordHasher.HashPassword(user, senha);
    }

    public bool VerifyPassword(Usuario user, string senha)
    {
        var result = _passwordHasher.VerifyHashedPassword(user, user.SenhaHash, senha);

        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
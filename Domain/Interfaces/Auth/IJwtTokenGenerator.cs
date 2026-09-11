using Domain.Entities;

namespace Domain.Interfaces.Auth;

public interface IJwtTokenGenerator
{
    string Generate(Usuario user, out DateTime expiresAt);
}
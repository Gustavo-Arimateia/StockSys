using Domain.Entities;

namespace Domain.Interfaces.Auth;

public interface IPasswordHasherService
{
    string HashPassword(Usuario user, string senha);

    bool VerifyPassword(Usuario user, string senha);
}
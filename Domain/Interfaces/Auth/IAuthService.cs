using Domain.DTOs.Auth;

namespace Domain.Interfaces.Auth;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(string email, string senha, CancellationToken ct = default);
}
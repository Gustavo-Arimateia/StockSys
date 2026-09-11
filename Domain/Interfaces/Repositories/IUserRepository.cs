using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<Usuario?> GetByEmailAsync(string email, CancellationToken ct = default);

    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);

    Task<Guid> CreateAsync(Usuario user, CancellationToken ct = default);

    Task UpdateLastLoginAsync(Guid userId, CancellationToken ct = default);
}
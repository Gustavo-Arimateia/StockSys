using Dapper;
using Domain.Entities;
using Domain.Interfaces.Infra;
using Domain.Interfaces.Repositories;

namespace Infrastructure.Repositories;

public sealed class UserRepository(ISqlConnectionFactory connectionFactory) : IUserRepository
{
    private readonly ISqlConnectionFactory _connectionFactory = connectionFactory;

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        const string sql = """
            SELECT
                Id,
                Nome,
                Email,
                NormalizedEmail,
                SenhaHash,
                Ativo,
                DataCriacaoUtc,
                DataAtualizacaoUtc,
                UltimoLoginUtc
            FROM Seguranca.Usuarios
            WHERE NormalizedEmail = UPPER(LTRIM(RTRIM(@Email)));
        """;

        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            sql,
            new { Email = email },
            cancellationToken: ct
        );

        return await connection.QuerySingleOrDefaultAsync<Usuario>(command);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
    {
        const string sql = """
            SELECT
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM Seguranca.Usuarios
                        WHERE NormalizedEmail = UPPER(LTRIM(RTRIM(@Email)))
                    )
                    THEN CAST(1 AS BIT)
                    ELSE CAST(0 AS BIT)
                END;
        """;

        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            sql,
            new { Email = email },
            cancellationToken: ct
        );

        return await connection.ExecuteScalarAsync<bool>(command);
    }

    public async Task<Guid> CreateAsync(Usuario user, CancellationToken ct = default)
    {
        const string sql = """
            INSERT INTO Seguranca.Usuarios
            (
                Nome,
                Email,
                SenhaHash,
                Ativo
            )
            OUTPUT INSERTED.Id
            VALUES
            (
                @Nome,
                @Email,
                @SenhaHash,
                @Ativo
            );
        """;

        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            sql,
            new
            {
                user.Nome,
                user.Email,
                user.SenhaHash,
                user.Ativo
            },
            cancellationToken: ct
        );

        return await connection.ExecuteScalarAsync<Guid>(command);
    }

    public async Task UpdateLastLoginAsync(Guid userId, CancellationToken ct = default)
    {
        const string sql = """
            UPDATE Seguranca.Usuarios
            SET 
                UltimoLoginUtc = SYSUTCDATETIME(),
                DataAtualizacaoUtc = SYSUTCDATETIME()
            WHERE Id = @UserId;
        """;

        using var connection = _connectionFactory.CreateConnection();

        var command = new CommandDefinition(
            sql,
            new { UserId = userId },
            cancellationToken: ct
        );

        await connection.ExecuteAsync(command);
    }
}
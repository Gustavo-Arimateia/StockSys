namespace Domain.Entities;

public sealed class Usuario
{
    public Guid Id { get; init; }

    public string Nome { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string NormalizedEmail { get; init; } = string.Empty;

    public string SenhaHash { get; init; } = string.Empty;

    public bool Ativo { get; init; }

    public DateTime DataCriacaoUtc { get; init; }

    public DateTime? DataAtualizacaoUtc { get; init; }

    public DateTime? UltimoLoginUtc { get; init; }
}
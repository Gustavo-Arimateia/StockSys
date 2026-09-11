namespace Domain.DTOs.Users;

public sealed class CreateUserResponseDto
{
    public Guid Id { get; init; }

    public string Nome { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;
}
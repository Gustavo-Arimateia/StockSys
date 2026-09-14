namespace Domain.Models.Errors;

public sealed class ApiErrorResponse
{
  public string Message { get; init; } = string.Empty;

  public string Code { get; init; } = string.Empty;

  public IReadOnlyCollection<string>? Errors { get; init; }
}
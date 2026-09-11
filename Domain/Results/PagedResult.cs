namespace Domain.Results;

public sealed class PagedResult<T>
{
  public IReadOnlyCollection<T> Items { get; init; } = [];

  public int Page { get; init; }

  public int PageSize { get; init; }

  public int TotalItems { get; init; }

  public int TotalPages { get; init; }
}
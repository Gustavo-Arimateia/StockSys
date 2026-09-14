namespace Application.Common.Exceptions;

public abstract class AppException(string message, string code) : Exception(message)
{
  public string Code { get; } = code;
}
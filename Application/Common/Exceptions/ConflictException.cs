namespace Application.Common.Exceptions;

public sealed class ConflictException(string message, string code) : AppException(message, code);
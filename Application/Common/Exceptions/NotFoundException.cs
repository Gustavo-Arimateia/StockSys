namespace Application.Common.Exceptions;

public sealed class NotFoundException(string message, string code) : AppException(message, code);
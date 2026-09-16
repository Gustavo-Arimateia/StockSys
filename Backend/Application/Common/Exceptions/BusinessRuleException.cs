namespace Application.Common.Exceptions;

public sealed class BusinessRuleException(string message, string code) : AppException(message, code);
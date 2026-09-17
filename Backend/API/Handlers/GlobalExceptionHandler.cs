using API.Models.Errors;
using Application.Common.Errors;
using Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace API.Handlers;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
  private readonly ILogger<GlobalExceptionHandler> _logger = logger;

  public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
  {
    var error = MapException(exception);

    if (error.StatusCode == StatusCodes.Status500InternalServerError)
      _logger.LogError(exception, "Erro não tratado durante o processamento da requisição.");

    context.Response.StatusCode = error.StatusCode;

    await context.Response.WriteAsJsonAsync(
      new ApiErrorResponse
      {
        Message = error.Message,
        Code = error.Code,
        Errors = error.Errors
      },
      cancellationToken);

    return true;
  }

  private static ErrorDetails MapException(Exception exception)
  {
    return exception switch
    {
      ValidationException validationException => new ErrorDetails(
        StatusCodes.Status400BadRequest,
        "Existem campos inválidos na requisição.",
        ErrorCodes.ValidationError,
        [.. validationException.Errors.Select(error => error.ErrorMessage).Distinct()]),

      NotFoundException notFoundException => new ErrorDetails(
        StatusCodes.Status404NotFound,
        notFoundException.Message,
        notFoundException.Code),

      BusinessRuleException businessRuleException => new ErrorDetails(
        StatusCodes.Status422UnprocessableEntity,
        businessRuleException.Message,
        businessRuleException.Code),

      ConflictException conflictException => new ErrorDetails(
        StatusCodes.Status409Conflict,
        conflictException.Message,
        conflictException.Code),

      _ => new ErrorDetails(
        StatusCodes.Status500InternalServerError,
        "Ocorreu um erro interno no servidor.",
        ErrorCodes.InternalError)
    };
  }

  private sealed record ErrorDetails(
    int StatusCode,
    string Message,
    string Code,
    IReadOnlyCollection<string>? Errors = null);
}

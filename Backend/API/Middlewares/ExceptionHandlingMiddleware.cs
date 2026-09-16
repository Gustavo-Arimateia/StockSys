using API.Models.Errors;
using Application.Common.Errors;
using Application.Common.Exceptions;
using FluentValidation;

namespace API.Middlewares;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
  private readonly RequestDelegate _next = next;
  private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

  public async Task InvokeAsync(HttpContext context)
  {
    try
    {
      await _next(context);
    }
    catch (ValidationException exception)
    {
      var errors = exception.Errors.Select(error => error.ErrorMessage).Distinct().ToArray();

      await WriteErrorAsync(context, StatusCodes.Status400BadRequest, "Existem campos inválidos na requisição.", ErrorCodes.ValidationError, errors);
    }
    catch (NotFoundException exception)
    {
      await WriteErrorAsync(context, StatusCodes.Status404NotFound, exception.Message, exception.Code);
    }
    catch (BusinessRuleException exception)
    {
      await WriteErrorAsync(context, StatusCodes.Status422UnprocessableEntity, exception.Message, exception.Code);
    }
    catch (ConflictException exception)
    {
      await WriteErrorAsync(context, StatusCodes.Status409Conflict, exception.Message, exception.Code);
    }
    catch (Exception exception)
    {
      _logger.LogError(exception, "Erro não tratado durante o processamento da requisição.");

      await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, "Ocorreu um erro interno no servidor.", ErrorCodes.InternalError);
    }
  }

  private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message, string code, IReadOnlyCollection<string>? errors = null)
  {
    context.Response.StatusCode = statusCode;

    await context.Response.WriteAsJsonAsync(
        new ApiErrorResponse
        {
          Message = message,
          Code = code,
          Errors = errors
        });
  }
}
using FluentValidation;

namespace API.Middlewares;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (Exception)
        {
            await HandleInternalExceptionAsync(context);
        }
    }

    private static async Task HandleValidationExceptionAsync(
        HttpContext context,
        ValidationException exception)
    {
        var errors = exception.Errors
            .Select(x => x.ErrorMessage)
            .Distinct()
            .ToList();

        string message = errors.Count == 1
            ? errors[0]
            : "Existem campos inválidos na requisição.";

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            message,
            data = (object?)null,
            errors
        });
    }

    private static async Task HandleInternalExceptionAsync(HttpContext context)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            message = "Ocorreu um erro interno ao processar a solicitação.",
            data = (object?)null
        });
    }
}
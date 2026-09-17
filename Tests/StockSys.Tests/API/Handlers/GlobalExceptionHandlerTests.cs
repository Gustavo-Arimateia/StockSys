using API.Handlers;
using API.Models.Errors;
using Application.Common.Errors;
using Application.Common.Exceptions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace StockSys.Tests.API.Handlers;

public sealed class GlobalExceptionHandlerTests
{
  [Fact]
  public async Task TryHandleAsync_ShouldReturn404_WhenNotFoundExceptionIsThrown()
  {
    var logger = new RecordingLogger<GlobalExceptionHandler>();

    var result = await ExecuteAsync(
      new NotFoundException("Produto não encontrado.", ErrorCodes.ProductNotFound),
      logger);

    Assert.True(result.Handled);
    Assert.Equal(StatusCodes.Status404NotFound, result.StatusCode);
    Assert.Equal(ErrorCodes.ProductNotFound, result.Response.Code);
    Assert.Equal("Produto não encontrado.", result.Response.Message);
    Assert.Null(result.Response.Errors);
    Assert.DoesNotContain(logger.Entries, entry => entry.Level == LogLevel.Error);
  }

  [Fact]
  public async Task TryHandleAsync_ShouldReturn400WithDistinctErrors_WhenValidationExceptionIsThrown()
  {
    var failures = new[]
    {
      new ValidationFailure("Price", "O preço do produto deve ser maior que zero."),
      new ValidationFailure("Price", "O preço do produto deve ser maior que zero."),
      new ValidationFailure("Name", "O nome do produto é obrigatório.")
    };

    var result = await ExecuteAsync(new ValidationException(failures));

    Assert.True(result.Handled);
    Assert.Equal(StatusCodes.Status400BadRequest, result.StatusCode);
    Assert.Equal(ErrorCodes.ValidationError, result.Response.Code);
    Assert.Equal("Existem campos inválidos na requisição.", result.Response.Message);
    Assert.Equal(2, result.Response.Errors!.Count);
    Assert.Contains("O preço do produto deve ser maior que zero.", result.Response.Errors);
    Assert.Contains("O nome do produto é obrigatório.", result.Response.Errors);
  }

  [Fact]
  public async Task TryHandleAsync_ShouldReturn422_WhenBusinessRuleExceptionIsThrown()
  {
    var result = await ExecuteAsync(
      new BusinessRuleException("Regra de negócio inválida.", "BUSINESS_RULE_TEST"));

    Assert.True(result.Handled);
    Assert.Equal(StatusCodes.Status422UnprocessableEntity, result.StatusCode);
    Assert.Equal("BUSINESS_RULE_TEST", result.Response.Code);
    Assert.Equal("Regra de negócio inválida.", result.Response.Message);
  }

  [Fact]
  public async Task TryHandleAsync_ShouldReturn409_WhenConflictExceptionIsThrown()
  {
    var result = await ExecuteAsync(
      new ConflictException("Conflito encontrado.", "CONFLICT_TEST"));

    Assert.True(result.Handled);
    Assert.Equal(StatusCodes.Status409Conflict, result.StatusCode);
    Assert.Equal("CONFLICT_TEST", result.Response.Code);
    Assert.Equal("Conflito encontrado.", result.Response.Message);
  }

  [Fact]
  public async Task TryHandleAsync_ShouldReturn500WithoutExposingInternalMessage_WhenUnexpectedExceptionIsThrown()
  {
    const string sensitiveMessage = "Mensagem interna que não pode ser exposta.";
    var logger = new RecordingLogger<GlobalExceptionHandler>();
    var exception = new InvalidOperationException(sensitiveMessage);

    var result = await ExecuteAsync(exception, logger);

    Assert.True(result.Handled);
    Assert.Equal(StatusCodes.Status500InternalServerError, result.StatusCode);
    Assert.Equal(ErrorCodes.InternalError, result.Response.Code);
    Assert.Equal("Ocorreu um erro interno no servidor.", result.Response.Message);
    Assert.DoesNotContain(sensitiveMessage, result.Response.Message);
    Assert.Contains(logger.Entries, entry => entry.Level == LogLevel.Error && ReferenceEquals(entry.Exception, exception));
  }

  private static async Task<HandlerResult> ExecuteAsync(
    Exception exception,
    ILogger<GlobalExceptionHandler>? logger = null)
  {
    var context = new DefaultHttpContext();
    context.Response.Body = new MemoryStream();

    var handler = new GlobalExceptionHandler(logger ?? new RecordingLogger<GlobalExceptionHandler>());
    var handled = await handler.TryHandleAsync(context, exception, CancellationToken.None);

    context.Response.Body.Position = 0;

    var response = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(
      context.Response.Body,
      new JsonSerializerOptions
      {
        PropertyNameCaseInsensitive = true
      });

    return new HandlerResult(handled, context.Response.StatusCode, response!);
  }

  private sealed record HandlerResult(bool Handled, int StatusCode, ApiErrorResponse Response);

  private sealed class RecordingLogger<T> : ILogger<T>
  {
    public List<LogEntry> Entries { get; } = [];

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(
      LogLevel logLevel,
      EventId eventId,
      TState state,
      Exception? exception,
      Func<TState, Exception?, string> formatter)
    {
      Entries.Add(new LogEntry(logLevel, exception, formatter(state, exception)));
    }
  }

  private sealed record LogEntry(LogLevel Level, Exception? Exception, string Message);

  private sealed class NullScope : IDisposable
  {
    public static NullScope Instance { get; } = new();

    public void Dispose()
    {
    }
  }
}

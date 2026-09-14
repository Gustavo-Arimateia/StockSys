using API.Middlewares;
using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Models.Errors;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using System.Text.Json;

namespace StockSys.Tests.API.Middlewares;

public sealed class ExceptionHandlingMiddlewareTests
{
  [Fact]
  public async Task InvokeAsync_ShouldReturn404_WhenNotFoundExceptionIsThrown()
  {
    var (statusCode, response) = await ExecuteAsync(new NotFoundException("Produto não encontrado.", ErrorCodes.ProductNotFound));

    Assert.Equal(StatusCodes.Status404NotFound, statusCode);

    Assert.Equal(ErrorCodes.ProductNotFound, response.Code);

    Assert.Equal("Produto não encontrado.", response.Message);
  }

  [Fact]
  public async Task InvokeAsync_ShouldReturn400_WhenValidationExceptionIsThrown()
  {
    var failures = new[]
    {
      new ValidationFailure("Price", "O preço do produto deve ser maior que zero.")
    };

    var (statusCode, response) = await ExecuteAsync(new ValidationException(failures));

    Assert.Equal(StatusCodes.Status400BadRequest, statusCode);

    Assert.Equal(ErrorCodes.ValidationError, response.Code);

    Assert.Contains("O preço do produto deve ser maior que zero.", response.Errors!);
  }

  [Fact]
  public async Task InvokeAsync_ShouldReturn422_WhenBusinessRuleExceptionIsThrown()
  {
    var (statusCode, response) = await ExecuteAsync(new BusinessRuleException("Regra de negócio inválida.", "BUSINESS_RULE_TEST"));

    Assert.Equal(StatusCodes.Status422UnprocessableEntity, statusCode);

    Assert.Equal("BUSINESS_RULE_TEST", response.Code);
  }

  [Fact]
  public async Task InvokeAsync_ShouldReturn409_WhenConflictExceptionIsThrown()
  {
    var (statusCode, response) = await ExecuteAsync(new ConflictException("Conflito encontrado.", "CONFLICT_TEST"));

    Assert.Equal(StatusCodes.Status409Conflict, statusCode);

    Assert.Equal("CONFLICT_TEST", response.Code);
  }

  [Fact]
  public async Task InvokeAsync_ShouldNotExposeInternalExceptionMessage()
  {
    const string sensitiveMessage = "Mensagem interna que não pode ser exposta.";

    var (statusCode, response) = await ExecuteAsync(new Exception(sensitiveMessage));

    Assert.Equal(StatusCodes.Status500InternalServerError, statusCode);

    Assert.Equal(ErrorCodes.InternalError, response.Code);

    Assert.DoesNotContain(sensitiveMessage, response.Message);
  }

  private static async Task<(int StatusCode, ApiErrorResponse Response)> ExecuteAsync(Exception exception)
  {
    var context = new DefaultHttpContext();

    context.Response.Body = new MemoryStream();

    var middleware = new ExceptionHandlingMiddleware(_ => throw exception, NullLogger<ExceptionHandlingMiddleware>.Instance);

    await middleware.InvokeAsync(context);

    context.Response.Body.Position = 0;

    var response = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(context.Response.Body,
    new JsonSerializerOptions
    {
      PropertyNameCaseInsensitive = true
    });

    return (context.Response.StatusCode, response!);
  }
}
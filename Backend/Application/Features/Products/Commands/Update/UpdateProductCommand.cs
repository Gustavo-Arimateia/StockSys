using Application.Features.Products.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace Application.Features.Products.Commands.Update;

public sealed record UpdateProductCommand : IRequest<ProductResponse>
{
    [JsonIgnore]
    public int Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public decimal Price { get; init; }

    public int StockQuantity { get; init; }
}
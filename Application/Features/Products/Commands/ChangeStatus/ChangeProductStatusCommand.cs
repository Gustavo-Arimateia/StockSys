using Application.Features.Products.Common;
using MediatR;

namespace Application.Features.Products.Commands.ChangeStatus;

public sealed record ChangeProductStatusCommand(
    int Id,
    bool IsActive) : IRequest<ProductResponse>;
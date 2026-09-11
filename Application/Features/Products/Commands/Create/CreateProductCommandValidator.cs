using FluentValidation;

namespace Application.Features.Products.Commands.Create;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
  public CreateProductCommandValidator()
  {
    RuleFor(product => product.Name)
        .NotEmpty()
        .WithMessage("O nome do produto é obrigatório.")
        .MaximumLength(150)
        .WithMessage("O nome do produto deve ter no máximo 150 caracteres.");

    RuleFor(product => product.Description)
        .NotEmpty()
        .WithMessage("A descrição do produto é obrigatória.")
        .MaximumLength(500)
        .WithMessage("A descrição do produto deve ter no máximo 500 caracteres.");

    RuleFor(product => product.Price)
        .GreaterThan(0)
        .WithMessage("O preço do produto deve ser maior que zero.");

    RuleFor(product => product.StockQuantity)
        .GreaterThanOrEqualTo(0)
        .WithMessage("A quantidade em estoque não pode ser negativa.");
  }
}
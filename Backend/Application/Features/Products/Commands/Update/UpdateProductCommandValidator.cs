using FluentValidation;

namespace Application.Features.Products.Commands.Update;

public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(command => command.Id)
            .GreaterThan(0)
            .WithMessage("O identificador do produto deve ser maior que zero.");

        RuleFor(command => command.Name)
            .NotEmpty()
            .WithMessage("O nome do produto é obrigatório.")
            .MaximumLength(150)
            .WithMessage("O nome do produto deve ter no máximo 150 caracteres.");

        RuleFor(command => command.Description)
            .NotEmpty()
            .WithMessage("A descrição do produto é obrigatória.")
            .MaximumLength(500)
            .WithMessage("A descrição do produto deve ter no máximo 500 caracteres.");

        RuleFor(command => command.Price)
            .GreaterThan(0)
            .WithMessage("O preço do produto deve ser maior que zero.");

        RuleFor(command => command.StockQuantity)
            .GreaterThanOrEqualTo(0)
            .WithMessage("A quantidade em estoque não pode ser negativa.");
    }
}
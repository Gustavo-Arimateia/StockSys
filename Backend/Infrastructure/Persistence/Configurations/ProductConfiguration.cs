using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
  public void Configure(EntityTypeBuilder<Product> builder)
  {
    builder.ToTable("Products", table => {

      table.HasCheckConstraint("CK_Products_Price_GreaterThanZero", "[Price] > 0");

      table.HasCheckConstraint("CK_Products_StockQuantity_NonNegative", "[StockQuantity] >= 0");
    });

    builder.HasKey(product => product.Id);

    builder.Property(product => product.Name)
        .HasMaxLength(150)
        .IsRequired();

    builder.Property(product => product.Description)
        .HasMaxLength(500)
        .IsRequired();

    builder.Property(product => product.Price)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.Property(product => product.StockQuantity)
        .IsRequired();

    builder.Property(product => product.IsActive)
        .IsRequired();

    builder.Property(product => product.CreatedAt)
        .IsRequired();

    builder.Property(product => product.RowVersion)
        .IsRowVersion();
  }
}
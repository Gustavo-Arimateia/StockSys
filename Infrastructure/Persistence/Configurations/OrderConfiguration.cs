using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
  public void Configure(EntityTypeBuilder<Order> builder)
  {
    builder.ToTable("Orders", table =>
    {
      table.HasCheckConstraint("CK_Orders_ProductsValue_NonNegative", "[ProductsValue] >= 0");

      table.HasCheckConstraint("CK_Orders_DiscountPercentage_Range", "[DiscountPercentage] >= 0 AND [DiscountPercentage] <= 20");

      table.HasCheckConstraint("CK_Orders_DiscountValue_NonNegative", "[DiscountValue] >= 0");

      table.HasCheckConstraint("CK_Orders_TotalValue_NonNegative", "[TotalValue] >= 0");
    });

    builder.HasKey(order => order.Id);

    builder.Property(order => order.CreatedAt)
        .IsRequired();

    builder.Property(order => order.Status)
        .HasConversion<int>()
        .IsRequired();

    builder.Property(order => order.ProductsValue)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.Property(order => order.DiscountPercentage)
        .HasPrecision(5, 2)
        .IsRequired();

    builder.Property(order => order.DiscountValue)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.Property(order => order.TotalValue)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.HasMany(order => order.Items)
        .WithOne()
        .HasForeignKey(item => item.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

    builder.Navigation(order => order.Items)
        .UsePropertyAccessMode(PropertyAccessMode.Field);

    builder.HasIndex(order => order.CreatedAt);

    builder.HasIndex(order => order.Status);
  }
}
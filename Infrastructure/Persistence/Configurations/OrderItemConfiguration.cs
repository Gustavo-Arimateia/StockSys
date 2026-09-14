using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
  public void Configure(EntityTypeBuilder<OrderItem> builder)
  {
    builder.ToTable("OrderItems", table =>
    {
      table.HasCheckConstraint("CK_OrderItems_Quantity_GreaterThanZero", "[Quantity] > 0");

      table.HasCheckConstraint("CK_OrderItems_UnitPrice_GreaterThanZero", "[UnitPrice] > 0");

      table.HasCheckConstraint("CK_OrderItems_Total_GreaterThanZero", "[Total] > 0");
    });

    builder.HasKey(item => item.Id);

    builder.Property(item => item.ProductName)
        .HasMaxLength(150)
        .IsRequired();

    builder.Property(item => item.Quantity)
        .IsRequired();

    builder.Property(item => item.UnitPrice)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.Property(item => item.Total)
        .HasPrecision(18, 2)
        .IsRequired();

    builder.HasOne<Product>()
        .WithMany()
        .HasForeignKey(item => item.ProductId)
        .OnDelete(DeleteBehavior.Restrict);

    builder.HasIndex(item => item.OrderId);

    builder.HasIndex(item => item.ProductId);
  }
}
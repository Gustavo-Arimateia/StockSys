using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public sealed class StockSysDbContext(DbContextOptions<StockSysDbContext> options): DbContext(options)
{
  public DbSet<Product> Products => Set<Product>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.ApplyConfigurationsFromAssembly(typeof(StockSysDbContext).Assembly);
  }
}
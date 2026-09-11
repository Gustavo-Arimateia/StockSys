using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public sealed class ProductRepository(StockSysDbContext dbContext) : IProductRepository
{
  private readonly StockSysDbContext _dbContext = dbContext;

  public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
  {
    await _dbContext.Products.AddAsync(product, cancellationToken);

    await _dbContext.SaveChangesAsync(cancellationToken);
  }
}
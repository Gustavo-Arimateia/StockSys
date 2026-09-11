using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class ProductRepository(StockSysDbContext dbContext) : IProductRepository
{
  private readonly StockSysDbContext _dbContext = dbContext;

  public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
  {
    await _dbContext.Products.AddAsync(product, cancellationToken);

    await _dbContext.SaveChangesAsync(cancellationToken);
  }

  public async Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
  {
    return await _dbContext.Products.AsNoTracking().FirstOrDefaultAsync(product => product.Id == id, cancellationToken);
  }
}
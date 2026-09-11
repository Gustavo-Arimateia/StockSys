
using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IProductRepository
{
  Task AddAsync(Product product, CancellationToken cancellationToken = default);

  Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
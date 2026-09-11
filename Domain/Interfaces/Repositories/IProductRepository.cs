
using Domain.Entities;
using Domain.Results;

namespace Domain.Interfaces.Repositories;

public interface IProductRepository
{
  Task AddAsync(Product product, CancellationToken cancellationToken = default);

  Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

  Task<PagedResult<Product>> GetPagedAsync(int page, int pageSize, string? name, bool? isActive, string sortBy, string sortDirection, CancellationToken cancellationToken = default);
}
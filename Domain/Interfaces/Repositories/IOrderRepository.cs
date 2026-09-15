using Domain.Entities;
using Domain.Enums;
using Domain.Results;

namespace Domain.Interfaces.Repositories;

public interface IOrderRepository
{
  Task CreateAsync(Order order, CancellationToken cancellationToken = default);

  Task<Order?> GetByIdempotencyKeyAsync(Guid idempotencyKey, CancellationToken cancellationToken = default);

  Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

  Task<PagedResult<Order>> GetPagedAsync(int page, int pageSize, OrderStatus? status, DateTime? startDate, DateTime? endDate, string sortBy, string sortDirection, CancellationToken cancellationToken = default);
}
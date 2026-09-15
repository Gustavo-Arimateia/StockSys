using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IOrderRepository
{
    Task CreateAsync(Order order, CancellationToken cancellationToken = default);
}
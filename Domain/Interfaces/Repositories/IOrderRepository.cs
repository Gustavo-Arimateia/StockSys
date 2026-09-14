using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IOrderRepository
{
    Task CreateAsync(Order order, CancellationToken cancellationToken = default);
}
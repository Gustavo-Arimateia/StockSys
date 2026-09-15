using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class OrderRepository(StockSysDbContext dbContext) : IOrderRepository
{
  private readonly StockSysDbContext _dbContext = dbContext;

  public async Task CreateAsync(Order order, CancellationToken cancellationToken = default)
  {
    await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

    try
    {
      await _dbContext.Orders.AddAsync(order, cancellationToken);

      await _dbContext.SaveChangesAsync(cancellationToken);

      await transaction.CommitAsync(cancellationToken);
    }
    catch (DbUpdateConcurrencyException)
    {
      await transaction.RollbackAsync(cancellationToken);

      throw new ConflictException("O estoque de um ou mais produtos foi alterado por outra operação. Atualize os dados e tente novamente.", ErrorCodes.ConcurrencyConflict);
    }
    catch (DbUpdateException exception) when (IsIdempotencyKeyViolation(exception))
    {
      await transaction.RollbackAsync(cancellationToken);

      throw new ConflictException( "A chave de idempotência já foi utilizada por outra operação.", ErrorCodes.IdempotencyKeyReused);
    }
    catch
    {
      await transaction.RollbackAsync(cancellationToken);

      throw;
    }
  }

  public async Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
  {
    return await _dbContext.Orders.AsNoTracking().Include(order => order.Items).FirstOrDefaultAsync(order => order.Id == id, cancellationToken);
  }

  public async Task<Order?> GetByIdempotencyKeyAsync(Guid idempotencyKey, CancellationToken cancellationToken = default)
  {
    return await _dbContext.Orders.AsNoTracking().Include(order => order.Items).FirstOrDefaultAsync(order => order.IdempotencyKey == idempotencyKey, cancellationToken);
  }

  private static bool IsIdempotencyKeyViolation(DbUpdateException exception)
  {
    return exception.InnerException is SqlException sqlException && sqlException.Number is 2601 or 2627 && sqlException.Message.Contains("IX_Orders_IdempotencyKey", StringComparison.OrdinalIgnoreCase);
  }
}
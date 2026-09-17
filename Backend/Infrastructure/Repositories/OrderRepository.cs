using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces.Repositories;
using Domain.Results;
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

  public async Task<PagedResult<Order>> GetPagedAsync(int page, int pageSize, OrderStatus? status, DateTime? startDate, DateTime? endDate, string sortBy, string sortDirection, CancellationToken cancellationToken = default)
  {
    var query = _dbContext.Orders.AsNoTracking();

    if (status.HasValue)
      query = query.Where(order => order.Status == status.Value);

    if (startDate.HasValue)
      query = query.Where(order => order.CreatedAt >= startDate.Value.Date);

    if (endDate.HasValue)
    {
      var exclusiveEndDate = endDate.Value.Date.AddDays(1);

      query = query.Where(order => order.CreatedAt < exclusiveEndDate);
    }

    var totalItems = await query.CountAsync(
      cancellationToken);

    query = ApplyOrdering(query, sortBy, sortDirection);

    var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

    return new PagedResult<Order>
    {
      Items = items,
      Page = page,
      PageSize = pageSize,
      TotalItems = totalItems,
      TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
    };
  }

  public async Task<Order?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default)
  {
    return await _dbContext.Orders.Include(order => order.Items).FirstOrDefaultAsync(order => order.Id == id, cancellationToken);
  }

  public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

    try
    {
      await _dbContext.SaveChangesAsync(cancellationToken);

      await transaction.CommitAsync(cancellationToken);
    }
    catch (DbUpdateConcurrencyException)
    {
      await transaction.RollbackAsync(cancellationToken);

      throw new ConflictException("O pedido ou estoque foi alterado por outra operação. Atualize os dados e tente novamente.", ErrorCodes.ConcurrencyConflict);
    }
    catch
    {
      await transaction.RollbackAsync(cancellationToken);

      throw;
    }
  }

  public async Task<Order?> GetByIdempotencyKeyAsync(Guid idempotencyKey, CancellationToken cancellationToken = default)
  {
    return await _dbContext.Orders.AsNoTracking().Include(order => order.Items).FirstOrDefaultAsync(order => order.IdempotencyKey == idempotencyKey, cancellationToken);
  }

  private static bool IsIdempotencyKeyViolation(DbUpdateException exception)
  {
    return exception.InnerException is SqlException sqlException && sqlException.Number is 2601 or 2627 && sqlException.Message.Contains("IX_Orders_IdempotencyKey", StringComparison.OrdinalIgnoreCase);
  }

  private static IQueryable<Order> ApplyOrdering(IQueryable<Order> query, string sortBy, string sortDirection)
  {
    var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

    return sortBy.ToLowerInvariant() switch
    {
      "id" => descending ? query.OrderByDescending(order => order.Id) : query.OrderBy(order => order.Id),
      "status" => descending ? query.OrderByDescending(order => order.Status).ThenBy(order => order.Id) : query.OrderBy(order => order.Status).ThenBy(order => order.Id),
      "productsvalue" => descending ? query.OrderByDescending(order => order.ProductsValue).ThenBy(order => order.Id) : query.OrderBy(order => order.ProductsValue).ThenBy(order => order.Id),
      "discountvalue" => descending ? query.OrderByDescending(order => order.DiscountValue).ThenBy(order => order.Id) : query.OrderBy(order => order.DiscountValue).ThenBy(order => order.Id),
      "totalvalue" => descending ? query.OrderByDescending(order => order.TotalValue).ThenBy(order => order.Id) : query.OrderBy(order => order.TotalValue).ThenBy(order => order.Id),
      _ => descending ? query.OrderByDescending(order => order.CreatedAt).ThenByDescending(order => order.Id) : query.OrderBy(order => order.CreatedAt).ThenBy(order => order.Id)
    };
  }
}
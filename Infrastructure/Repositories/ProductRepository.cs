using Domain.Entities;
using Domain.Interfaces.Repositories;
using Domain.Results;
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

    public async Task<PagedResult<Product>> GetPagedAsync(int page, int pageSize, string? name, bool? isActive, string sortBy, string sortDirection, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            var normalizedName = name.Trim();

            query = query.Where(product => product.Name.Contains(normalizedName));
        }

        if (isActive.HasValue)
            query = query.Where(product => product.IsActive == isActive.Value);


        query = ApplyOrdering(query, sortBy, sortDirection);

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<Product>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    private static IQueryable<Product> ApplyOrdering(IQueryable<Product> query, string sortBy, string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLowerInvariant() switch
        {
            "id" => descending ? query.OrderByDescending(product => product.Id) : query.OrderBy(product => product.Id),
            "price" => descending ? query.OrderByDescending(product => product.Price) : query.OrderBy(product => product.Price),
            "stockquantity" => descending ? query.OrderByDescending(product => product.StockQuantity) : query.OrderBy(product => product.StockQuantity),
            "createdat" => descending ? query.OrderByDescending(product => product.CreatedAt) : query.OrderBy(product => product.CreatedAt),
            _ => descending ? query.OrderByDescending(product => product.Name) : query.OrderBy(product => product.Name)
        };
    }

    public async Task<Product?> GetForUpdateAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products.FirstOrDefaultAsync(product => product.Id == id, cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
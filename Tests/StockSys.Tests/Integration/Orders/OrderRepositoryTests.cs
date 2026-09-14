using Application.Common.Errors;
using Application.Common.Exceptions;
using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using StockSys.Tests.Integration.Infrastructure;

namespace StockSys.Tests.Integration.Orders;

[Collection("SqlServer")]
public sealed class OrderRepositoryTests(SqlServerFixture fixture)
{
    private readonly SqlServerFixture _fixture = fixture;

    [Fact]
    public async Task CreateAsync_ShouldRejectSecondOrder_WhenStockWasChangedByAnotherContext()
    {
        await _fixture.ResetDatabaseAsync();

        int productId;

        await using (var seedContext = _fixture.CreateDbContext())
        {
            var product = new Product("Mouse", "Mouse Gamer", 100m, 1);

            seedContext.Products.Add(product);

            await seedContext.SaveChangesAsync();

            productId = product.Id;
        }

        await using var firstContext = _fixture.CreateDbContext();

        await using var secondContext = _fixture.CreateDbContext();

        var firstProduct = await firstContext.Products.SingleAsync(product => product.Id == productId);

        var secondProduct = await secondContext.Products.SingleAsync(product => product.Id == productId);

        Assert.True(firstProduct.TryDecreaseStock(1));

        Assert.True(secondProduct.TryDecreaseStock(1));

        var firstOrder = new Order([new OrderItem(firstProduct.Id, firstProduct.Name, 1, firstProduct.Price)], 0);

        var secondOrder = new Order([new OrderItem(secondProduct.Id, secondProduct.Name, 1, secondProduct.Price)], 0);

        var firstRepository = new OrderRepository(firstContext);

        var secondRepository = new OrderRepository(secondContext);

        await firstRepository.CreateAsync(firstOrder);

        var exception = await Assert.ThrowsAsync<ConflictException>(() => secondRepository.CreateAsync(secondOrder));

        Assert.Equal(ErrorCodes.ConcurrencyConflict, exception.Code);

        await using var verificationContext = _fixture.CreateDbContext();

        var productAfterConcurrency = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

        var ordersCount = await verificationContext.Orders.CountAsync();

        var orderItemsCount = await verificationContext.OrderItems.CountAsync();

        Assert.Equal(0, productAfterConcurrency.StockQuantity);
        Assert.Equal(1, ordersCount);
        Assert.Equal(1, orderItemsCount);
    }

    [Fact]
    public async Task CreateAsync_ShouldRollbackOrderAndStock_WhenPersistenceFails()
    {
        await _fixture.ResetDatabaseAsync();

        int productId;

        await using (var seedContext = _fixture.CreateDbContext())
        {
            var product = new Product("Mouse", "Mouse Gamer", 100m, 5);

            seedContext.Products.Add(product);

            await seedContext.SaveChangesAsync();

            productId = product.Id;
        }

        await using (var dbContext = _fixture.CreateDbContext())
        {
            var product = await dbContext.Products.SingleAsync(product => product.Id == productId);

            product.TryDecreaseStock(1);

            var invalidOrder = new Order([new OrderItem(999999, "Produto inexistente", 1, 100m)], 0);

            var repository = new OrderRepository(dbContext);

            await Assert.ThrowsAsync<DbUpdateException>(() => repository.CreateAsync(invalidOrder));
        }

        await using var verificationContext = _fixture.CreateDbContext();

        var productAfterFailure = await verificationContext.Products.AsNoTracking().SingleAsync(product => product.Id == productId);

        var ordersCount = await verificationContext.Orders.CountAsync();

        var orderItemsCount = await verificationContext.OrderItems.CountAsync();

        Assert.Equal(5, productAfterFailure.StockQuantity);
        Assert.Equal(0, ordersCount);
        Assert.Equal(0, orderItemsCount);
    }
}
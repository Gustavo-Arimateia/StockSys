using Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace StockSys.Tests.Integration.Infrastructure;

public sealed class SqlServerFixture : IAsyncLifetime
{
    private const string DatabaseName = "StockSysTests";

    private readonly MsSqlContainer _container = new MsSqlBuilder().WithImage("mcr.microsoft.com/mssql/server:2022-latest").Build();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        await using var dbContext = CreateDbContext();

        await dbContext.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }

    public StockSysDbContext CreateDbContext()
    {
        var connectionStringBuilder = new SqlConnectionStringBuilder(_container.GetConnectionString())
        {
            InitialCatalog = DatabaseName
        };

        var options = new DbContextOptionsBuilder<StockSysDbContext>().UseSqlServer(connectionStringBuilder.ConnectionString).Options;

        return new StockSysDbContext(options);
    }

    public async Task ResetDatabaseAsync()
    {
        await using var dbContext = CreateDbContext();

        await dbContext.Database.EnsureDeletedAsync();

        await dbContext.Database.MigrateAsync();
    }
}
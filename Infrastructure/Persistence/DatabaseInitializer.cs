using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Persistence;

public static class DatabaseInitializer
{
  public static async Task MigrateAsync(IServiceProvider serviceProvider)
  {
    await using var scope = serviceProvider.CreateAsyncScope();

    var dbContext = scope.ServiceProvider.GetRequiredService<StockSysDbContext>();

    await dbContext.Database.MigrateAsync();
  }
}
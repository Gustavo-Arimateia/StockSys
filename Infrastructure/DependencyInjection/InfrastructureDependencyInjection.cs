using Domain.Interfaces.Infra;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.DependencyInjection;

public static class InfrastructureDependencyInjection
{
  public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não configurada.");

    services.AddDbContext<StockSysDbContext>(options => options.UseSqlServer( connectionString, sqlServerOptions =>
    {
      sqlServerOptions.EnableRetryOnFailure(
          maxRetryCount: 5,
          maxRetryDelay: TimeSpan.FromSeconds(5),
          errorNumbersToAdd: null);
    }));

    services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

    return services;
  }
}
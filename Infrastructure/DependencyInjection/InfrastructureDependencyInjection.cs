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

    services.AddDbContext<StockSysDbContext>(options => options.UseSqlServer(connectionString));

    services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

    return services;
  }
}
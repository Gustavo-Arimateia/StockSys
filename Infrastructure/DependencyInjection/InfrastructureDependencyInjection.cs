using Domain.Interfaces.Infra;
using Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.DependencyInjection;

public static class InfrastructureDependencyInjection
{
  public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
  {

    services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

    return services;
  }
}
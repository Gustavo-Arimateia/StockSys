using System.Data;
using Domain.Interfaces.Infra;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Persistence;


public sealed class SqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    private readonly IConfiguration _configuration = configuration;

    public IDbConnection CreateConnection()
    {
        string? connectionString = _configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string 'DefaultConnection' não foi configurada.");

        return new SqlConnection(connectionString);
    }
}
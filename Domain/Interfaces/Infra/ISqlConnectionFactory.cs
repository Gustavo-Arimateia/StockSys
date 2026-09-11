using System.Data;

namespace Domain.Interfaces.Infra;

public interface ISqlConnectionFactory
{
    IDbConnection CreateConnection();
}

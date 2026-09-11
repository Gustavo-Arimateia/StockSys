namespace Application.Common.Responses;

public sealed class ServiceResponse<T>
{
    public bool Success { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public T? Data { get; private set; }

    public static ServiceResponse<T> Ok(T data, string message = "Operação realizada com sucesso.")
    {
        return new ServiceResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ServiceResponse<T> Fail(string message)
    {
        return new ServiceResponse<T>
        {
            Success = false,
            Message = message
        };
    }
}
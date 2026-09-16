using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Orders.Commands.Create;

public static class OrderRequestHasher
{
  public static string Compute(CreateOrderCommand command)
  {
    var items = command.Items.OrderBy(item => item.ProductId).Select(item => $"{item.ProductId}:{item.Quantity}");

    var discount = command.DiscountPercentage.ToString("G29", CultureInfo.InvariantCulture);

    var content = $"{discount}|{string.Join("|", items)}";

    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(content));

    return Convert.ToHexString(bytes);
  }
}
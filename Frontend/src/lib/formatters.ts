const currencyFormatter =
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
    },
  );

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );

export function formatCurrency(
  value: number,
): string {
  return currencyFormatter.format(value);
}

export function formatDate(
  value: string,
): string {
  return dateFormatter.format(
    new Date(value),
  );
}

export function formatDateTime(
  value: string,
): string {
  return dateTimeFormatter.format(
    new Date(value),
  );
}
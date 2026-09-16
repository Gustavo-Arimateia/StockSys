import { Package } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";
import type { OrderItem } from "@/types/order";

type OrderDetailsItemsProps = {
  items: OrderItem[];
};

export default function OrderDetailsItems({ items }: OrderDetailsItemsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">Itens do pedido</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Produtos e valores registrados no momento da criação do pedido.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Produto
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
                Quantidade
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Preço unitário
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map(item => (
              <tr key={item.productId} className="hover:bg-surface-secondary/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Package size={17} />
                    </div>

                    <div>
                      <span className="block font-medium text-text">{item.productName}</span>
                      <span className="block text-xs text-text-muted">Produto #{item.productId}</span>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-center text-sm font-medium text-text">
                  {item.quantity}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-text">
                  {formatCurrency(item.unitPrice)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-text">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
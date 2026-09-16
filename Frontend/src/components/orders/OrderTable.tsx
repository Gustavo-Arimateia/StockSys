import { ClipboardList } from "lucide-react";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { OrderSummary } from "@/types/order";

type OrderTableProps = {
  orders: OrderSummary[];
};

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Pedido
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Data
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Produtos
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Desconto
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {orders.map(order => (
              <tr key={order.id} className="transition-colors hover:bg-surface-secondary/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <ClipboardList size={19} />
                    </div>

                    <span className="font-semibold text-text">#{order.id}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-text-secondary">
                  {formatDateTime(order.createdAt)}
                </td>

                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-text">
                  {formatCurrency(order.productsValue)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <span className="block text-sm text-text">
                    {order.discountPercentage}%
                  </span>

                  <span className="block text-xs text-text-secondary">
                    - {formatCurrency(order.discountValue)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-text">
                  {formatCurrency(order.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
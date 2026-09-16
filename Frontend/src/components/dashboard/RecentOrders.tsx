import { ArrowRight, ClipboardList } from "lucide-react";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import type { OrderSummary } from "@/types/order";

type RecentOrdersProps = {
  orders: OrderSummary[];
  onView: (id: number) => void;
  onViewAll: () => void;
};

export default function RecentOrders({ orders, onView, onViewAll }: RecentOrdersProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-text">Pedidos recentes</h2>
          <p className="mt-1 text-sm text-text-secondary">Últimos pedidos cadastrados no sistema.</p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Ver todos
          <ArrowRight size={16} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ClipboardList size={21} />
          </div>

          <p className="mt-3 text-sm font-medium text-text">Nenhum pedido cadastrado</p>
          <p className="mt-1 text-xs text-text-secondary">
            Os pedidos mais recentes aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orders.map(order => (
            <button
              key={order.id}
              type="button"
              onClick={() => onView(order.id)}
              className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-secondary/70 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <ClipboardList size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text">Pedido #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <span className="mt-1 block text-xs text-text-secondary">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="block font-semibold text-text">
                  {formatCurrency(order.totalValue)}
                </span>

                {order.discountPercentage > 0 && (
                  <span className="mt-0.5 block text-xs text-text-secondary">
                    {order.discountPercentage}% de desconto
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
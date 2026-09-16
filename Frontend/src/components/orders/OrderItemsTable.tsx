import { Minus, Plus, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

export type OrderDraftItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  stockQuantity: number;
  quantity: number;
};

type OrderItemsTableProps = {
  items: OrderDraftItem[];
  disabled?: boolean;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
};

export default function OrderItemsTable({
  items,
  disabled = false,
  onQuantityChange,
  onRemove
}: OrderItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Produto
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Preço
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
                Quantidade
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Total
              </th>

              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map(item => (
              <tr key={item.productId} className="hover:bg-surface-secondary/60">
                <td className="px-4 py-4">
                  <span className="block font-medium text-text">{item.productName}</span>
                  <span className="mt-0.5 block text-xs text-text-secondary">
                    Estoque disponível: {item.stockQuantity}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-sm text-text">
                  {formatCurrency(item.unitPrice)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      disabled={disabled || item.quantity <= 1}
                      onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={15} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={item.stockQuantity}
                      value={item.quantity}
                      disabled={disabled}
                      onChange={event => onQuantityChange(item.productId, Number(event.target.value))}
                      className="h-8 w-16 rounded-lg border border-border bg-surface text-center text-sm font-medium text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      aria-label={`Quantidade de ${item.productName}`}
                    />

                    <button
                      type="button"
                      disabled={disabled || item.quantity >= item.stockQuantity}
                      onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-text">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(item.productId)}
                    className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remover ${item.productName}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { LoaderCircle, Package, Pencil, Power, PowerOff } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Product } from "@/types/product";

type ProductTableProps = {
  products: Product[];
  changingProductId?: number | null;
  onEdit: (id: number) => void;
  onToggleStatus: (product: Product) => void;
};

export default function ProductTable({
  products,
  changingProductId,
  onEdit,
  onToggleStatus
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Produto
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Preço
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Estoque
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                Cadastrado em
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {products.map(product => {
              const isChanging = changingProductId === product.id;

              return (
                <tr key={product.id} className="transition-colors hover:bg-surface-secondary/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Package size={19} />
                      </div>

                      <div className="min-w-0">
                        <span className="block font-medium text-text">{product.name}</span>

                        {product.description && (
                          <span className="mt-0.5 block max-w-md truncate text-sm text-text-secondary">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-text">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-5 py-4">
                    <StockQuantity quantity={product.stockQuantity} />
                  </td>

                  <td className="px-5 py-4">
                    <Badge variant={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-text-secondary">
                    {formatDate(product.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isChanging}
                        onClick={() => onEdit(product.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={isChanging}
                        onClick={() => onToggleStatus(product)}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          product.isActive
                            ? "border-danger/20 bg-danger-soft text-danger hover:border-danger/30"
                            : "border-success/20 bg-success-soft text-success hover:border-success/30"
                        }`}
                      >
                        {isChanging ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : product.isActive ? (
                          <PowerOff size={15} />
                        ) : (
                          <Power size={15} />
                        )}

                        {product.isActive ? "Inativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type StockQuantityProps = {
  quantity: number;
};

function StockQuantity({ quantity }: StockQuantityProps) {
  const lowStock = quantity > 0 && quantity <= 5;

  if (quantity === 0) {
    return (
      <span className="inline-flex rounded-md bg-danger-soft px-2 py-1 text-sm font-medium text-danger">
        Sem estoque
      </span>
    );
  }

  if (lowStock) {
    return (
      <span className="inline-flex rounded-md bg-warning-soft px-2 py-1 text-sm font-medium text-warning">
        {quantity}
      </span>
    );
  }

  return <span className="text-sm font-medium text-text">{quantity}</span>;
}
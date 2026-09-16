import { Package, Pencil } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Product } from "@/types/product";

type ProductTableProps = {
  products: Product[];
  onEdit: (id: number) => void;
};

export default function ProductTable({ products, onEdit }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
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
            {products.map(product => (
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

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(product.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
                  >
                    <Pencil size={15} />
                    Editar
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
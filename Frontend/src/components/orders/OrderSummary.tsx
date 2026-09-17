import { LoaderCircle, ShoppingCart } from "lucide-react";

import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";

type OrderSummaryProps = {
  productsValue: number;
  discountPercentage: string;
  discountValue: number;
  totalValue: number;
  discountError?: string | null;
  isSubmitting: boolean;
  canSubmit: boolean;
  onDiscountChange: (value: string) => void;
  onCancel: () => void;
};

export default function OrderSummary({
  productsValue,
  discountPercentage,
  discountValue,
  totalValue,
  discountError,
  isSubmitting,
  canSubmit,
  onDiscountChange,
  onCancel
}: OrderSummaryProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">Resumo do pedido</h2>
        <p className="mt-1 text-sm text-text-secondary">Confira os valores antes de criar o pedido.</p>
      </div>

      <div className="space-y-4 p-5">
        <SummaryLine label="Subtotal" value={formatCurrency(productsValue)} />

        <div>
          <label htmlFor="discountPercentage" className="mb-1.5 block text-sm font-medium text-text">
            Desconto
          </label>

          <div className="relative">
            <input
              id="discountPercentage"
              type="number"
              min="0"
              max="20"
              step="0.01"
              value={discountPercentage}
              disabled={isSubmitting}
              onChange={event => onDiscountChange(event.target.value)}
              className={`h-10 w-full rounded-lg border bg-surface px-3 pr-9 text-sm text-text outline-none focus:ring-2 ${
                discountError
                  ? "border-danger focus:ring-danger/10"
                  : "border-border focus:border-primary focus:ring-primary/10"
              }`}
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              %
            </span>
          </div>

          <p className={`mt-1 text-xs ${discountError ? "text-danger" : "text-text-muted"}`}>
            {discountError ?? "Permitido de 0% a 20%."}
          </p>
        </div>

        <SummaryLine label="Valor do desconto" value={`- ${formatCurrency(discountValue)}`} />

        <div className="border-t border-border pt-4">
          <div className="flex items-end justify-between gap-4">
            <span className="font-medium text-text">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 border-t border-border bg-surface-secondary p-5 sm:grid-cols-2 lg:grid-cols-1">
        <Button variant="secondary" disabled={isSubmitting} onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Criando pedido...
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Criar pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

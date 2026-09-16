import { formatCurrency } from "@/lib/formatters";
import type { Order } from "@/types/order";

type OrderFinancialSummaryProps = {
  order: Order;
};

export default function OrderFinancialSummary({ order }: OrderFinancialSummaryProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">Resumo financeiro</h2>
      </div>

      <div className="space-y-4 p-5">
        <SummaryLine label="Produtos" value={formatCurrency(order.productsValue)} />

        <SummaryLine
          label={`Desconto (${order.discountPercentage}%)`}
          value={`- ${formatCurrency(order.discountValue)}`}
        />

        <div className="border-t border-border pt-4">
          <div className="flex items-end justify-between gap-4">
            <span className="font-medium text-text">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(order.totalValue)}
            </span>
          </div>
        </div>
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
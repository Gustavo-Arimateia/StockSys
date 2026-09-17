type DashboardBarVariant = "primary" | "success" | "warning" | "info" | "danger" | "neutral";

export type DashboardBarItem = {
  label: string;
  value: number;
  variant: DashboardBarVariant;
};

type DashboardBarChartProps = {
  title: string;
  description: string;
  items: DashboardBarItem[];
};

const barClasses: Record<DashboardBarVariant, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  danger: "bg-danger",
  neutral: "bg-slate-400"
};

export default function DashboardBarChart({
  title,
  description,
  items
}: DashboardBarChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      <div className="space-y-5 p-5">
        {items.map(item => {
          const percentage = total > 0 ? item.value / total * 100 : 0;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-text">{item.label}</span>
                <span className="text-sm font-semibold text-text">{item.value}</span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  role="progressbar"
                  aria-label={item.label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percentage)}
                  className={`h-full rounded-full transition-all duration-500 ${barClasses[item.variant]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="mt-1.5 text-xs text-text-muted">
                {formatPercentage(percentage)} do total
              </p>
            </div>
          );
        })}

        {total === 0 && (
          <p className="py-4 text-center text-sm text-text-secondary">
            Nenhum dado disponível.
          </p>
        )}
      </div>
    </section>
  );
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })}%`;
}
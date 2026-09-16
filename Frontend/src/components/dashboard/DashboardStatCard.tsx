import type { LucideIcon } from "lucide-react";

type DashboardStatCardVariant = "primary" | "success" | "warning" | "neutral";

type DashboardStatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant?: DashboardStatCardVariant;
};

const variantClasses: Record<DashboardStatCardVariant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-slate-100 text-slate-600"
};

export default function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "primary"
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text">{value}</p>
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        </div>

        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${variantClasses[variant]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
import { CalendarDays, SlidersHorizontal, X } from "lucide-react";

import Button from "@/components/ui/Button";
import { OrderStatus } from "@/types/order";

export type OrderStatusFilter = "all" | OrderStatus;
export type OrderSortOption = "createdAt:desc" | "createdAt:asc";

type OrderFiltersProps = {
  status: OrderStatusFilter;
  startDate: string;
  endDate: string;
  sort: OrderSortOption;
  onStatusChange: (value: OrderStatusFilter) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSortChange: (value: OrderSortOption) => void;
  onClear: () => void;
};

export default function OrderFilters({
  status,
  startDate,
  endDate,
  sort,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onSortChange,
  onClear
}: OrderFiltersProps) {
  const hasFilters = status !== "all" || startDate !== "" || endDate !== "";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm xl:flex-row xl:items-center">
      <select
        value={status}
        onChange={event => {
          const value = event.target.value;
          onStatusChange(value === "all" ? "all" : Number(value) as OrderStatus);
        }}
        className="h-10 min-w-52 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        aria-label="Filtrar por status"
      >
        <option value="all">Todos os status</option>
        <option value={OrderStatus.Pending}>Pendentes</option>
        <option value={OrderStatus.Processing}>Em processamento</option>
        <option value={OrderStatus.Completed}>Concluídos</option>
        <option value={OrderStatus.Cancelled}>Cancelados</option>
      </select>

      <DateFilter
        label="De"
        value={startDate}
        max={endDate || undefined}
        ariaLabel="Data inicial"
        onChange={onStartDateChange}
      />

      <DateFilter
        label="Até"
        value={endDate}
        min={startDate || undefined}
        ariaLabel="Data final"
        onChange={onEndDateChange}
      />

      <div className="relative xl:ml-auto">
        <SlidersHorizontal
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <select
          value={sort}
          onChange={event => onSortChange(event.target.value as OrderSortOption)}
          className="h-10 min-w-48 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          aria-label="Ordenar pedidos"
        >
          <option value="createdAt:desc">Mais recentes</option>
          <option value="createdAt:asc">Mais antigos</option>
        </select>
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear}>
          <X size={16} />
          Limpar
        </Button>
      )}
    </div>
  );
}

type DateFilterProps = {
  label: string;
  value: string;
  min?: string;
  max?: string;
  ariaLabel: string;
  onChange: (value: string) => void;
};

function DateFilter({ label, value, min, max, ariaLabel, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-text-secondary">{label}</span>

      <div className="relative">
        <CalendarDays
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={event => onChange(event.target.value)}
          className="h-10 rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}

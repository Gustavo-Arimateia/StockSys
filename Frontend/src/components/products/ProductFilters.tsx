import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

export type ProductStatusFilter =
  | "all"
  | "active"
  | "inactive";

export type ProductSortOption =
  | "createdAt:desc"
  | "createdAt:asc"
  | "name:asc"
  | "name:desc"
  | "price:asc"
  | "price:desc"
  | "stockQuantity:asc"
  | "stockQuantity:desc";

type ProductFiltersProps = {
  search: string;
  status: ProductStatusFilter;
  sort: ProductSortOption;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: ProductStatusFilter,
  ) => void;

  onSortChange: (
    value: ProductSortOption,
  ) => void;
};

export default function ProductFilters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div
      className="
        flex flex-col gap-3
        rounded-xl
        border border-border
        bg-surface
        p-4
        shadow-sm
        lg:flex-row
        lg:items-center
      "
    >
      <div className="relative min-w-0 flex-1">
        <Search
          size={18}
          className="
            pointer-events-none
            absolute left-3 top-1/2
            -translate-y-1/2
            text-text-muted
          "
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Buscar produto..."
          className="
            h-10 w-full
            rounded-lg
            border border-border
            bg-surface
            pl-10 pr-3
            text-sm text-text
            outline-none
            transition
            placeholder:text-text-muted
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        />
      </div>

      <div className="relative">
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target
                .value as ProductStatusFilter,
            )
          }
          className="
            h-10 min-w-44
            appearance-none
            rounded-lg
            border border-border
            bg-surface
            px-3 pr-9
            text-sm text-text
            outline-none
            transition
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option value="all">
            Todos os status
          </option>

          <option value="active">
            Ativos
          </option>

          <option value="inactive">
            Inativos
          </option>
        </select>
      </div>

      <div className="relative">
        <SlidersHorizontal
          size={16}
          className="
            pointer-events-none
            absolute left-3 top-1/2
            -translate-y-1/2
            text-text-muted
          "
        />

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target
                .value as ProductSortOption,
            )
          }
          className="
            h-10 min-w-48
            appearance-none
            rounded-lg
            border border-border
            bg-surface
            pl-9 pr-3
            text-sm text-text
            outline-none
            transition
            focus:border-primary
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option value="createdAt:desc">
            Mais recentes
          </option>

          <option value="createdAt:asc">
            Mais antigos
          </option>

          <option value="name:asc">
            Nome A–Z
          </option>

          <option value="name:desc">
            Nome Z–A
          </option>

          <option value="price:desc">
            Maior preço
          </option>

          <option value="price:asc">
            Menor preço
          </option>

          <option value="stockQuantity:desc">
            Maior estoque
          </option>

          <option value="stockQuantity:asc">
            Menor estoque
          </option>
        </select>
      </div>
    </div>
  );
}
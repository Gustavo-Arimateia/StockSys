import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus, ShoppingCart } from "lucide-react";

import OrderFilters, { type OrderSortOption, type OrderStatusFilter } from "@/components/orders/OrderFilters";
import OrderTable from "@/components/orders/OrderTable";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage, isAbortError } from "@/lib/api/api-errors";
import { ordersApi } from "@/lib/api/orders-api";
import type { PagedResult } from "@/types/api";
import type { OrderSummary } from "@/types/order";

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const router = useRouter();

  const [ordersResult, setOrdersResult] = useState<PagedResult<OrderSummary> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<OrderSortOption>("createdAt:desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const getOrdersRequest = useCallback((signal?: AbortSignal) => {
    const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"];

    return ordersApi.getAll({
      page,
      pageSize: PAGE_SIZE,
      status: status === "all" ? undefined : status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortDirection
    }, { signal });
  }, [page, status, startDate, endDate, sort]);

  useEffect(() => {
    const controller = new AbortController();

    getOrdersRequest(controller.signal)
      .then(result => {
        setOrdersResult(result);
        setError(null);
      })
      .catch(error => {
        if (isAbortError(error))
          return;

        setError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setIsLoading(false);
      });

    return () => controller.abort();
  }, [getOrdersRequest, retryKey]);

  function handleStatusChange(value: OrderStatusFilter) {
    setPage(1);
    setStatus(value);
    prepareReload();
  }

  function handleStartDateChange(value: string) {
    setPage(1);
    setStartDate(value);
    prepareReload();
  }

  function handleEndDateChange(value: string) {
    setPage(1);
    setEndDate(value);
    prepareReload();
  }

  function handleSortChange(value: OrderSortOption) {
    setPage(1);
    setSort(value);
    prepareReload();
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    prepareReload();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function handleClearFilters() {
    setPage(1);
    setStatus("all");
    setStartDate("");
    setEndDate("");
    prepareReload();
  }

  function handleRetry() {
    prepareReload();
    setRetryKey(current => current + 1);
  }

  function prepareReload() {
    setIsLoading(true);
    setError(null);
  }

  const hasFilters = status !== "all" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Pedidos cadastrados</h2>

          <p className="mt-1 text-sm text-text-secondary">
            {ordersResult
              ? `${ordersResult.totalItems} ${ordersResult.totalItems === 1 ? "pedido encontrado" : "pedidos encontrados"}.`
              : "Consulte e acompanhe os pedidos cadastrados."}
          </p>
        </div>

        <Button className="shrink-0" onClick={() => void router.push("/orders/new")}>
          <Plus size={18} />
          Novo pedido
        </Button>
      </div>

      <OrderFilters
        status={status}
        startDate={startDate}
        endDate={endDate}
        sort={sort}
        onStatusChange={handleStatusChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSortChange={handleSortChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <div className="rounded-xl border border-border bg-surface">
          <LoadingState message="Carregando pedidos..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      ) : !ordersResult || ordersResult.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <EmptyState
            icon={ShoppingCart}
            title={hasFilters ? "Nenhum pedido encontrado" : "Nenhum pedido cadastrado"}
            description={
              hasFilters
                ? "Tente alterar os filtros utilizados."
                : "Quando o primeiro pedido for criado, ele aparecerá nesta lista."
            }
          />
        </div>
      ) : (
        <>
          <OrderTable
            orders={ordersResult.items}
            onView={id => void router.push(`/orders/${id}`)}
          />

          <Pagination
            page={ordersResult.page}
            pageSize={ordersResult.pageSize}
            totalItems={ordersResult.totalItems}
            totalPages={ordersResult.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

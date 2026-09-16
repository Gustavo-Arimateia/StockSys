import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowLeft, CalendarDays, Hash } from "lucide-react";

import OrderDetailsItems from "@/components/orders/OrderDetailsItems";
import OrderFinancialSummary from "@/components/orders/OrderFinancialSummary";
import OrderStatusActions from "@/components/orders/OrderStatusActions";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/http-client";
import { ordersApi } from "@/lib/api/orders-api";
import { formatDateTime } from "@/lib/formatters";
import { OrderStatus, type Order } from "@/types/order";

export default function OrderDetailsPage() {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const getOrderId = useCallback(() => {
    if (!router.isReady)
      return null;

    const rawId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const id = Number(rawId);

    return Number.isInteger(id) && id > 0 ? id : null;
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    if (!router.isReady)
      return;

    const orderId = getOrderId();

    if (!orderId) {
      setLoadError("O identificador do pedido é inválido.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    ordersApi.getById(orderId, { signal: controller.signal })
      .then(result => {
        setOrder(result);
        setLoadError(null);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        setLoadError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setIsLoading(false);
      });

    return () => controller.abort();
  }, [router.isReady, getOrderId, retryKey]);

  async function changeStatus(status: OrderStatus) {
    if (!order)
      return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedOrder = await ordersApi.changeStatus(order.id, { status });

      setOrder(updatedOrder);
      setShowCancelDialog(false);
    } catch (error) {
      if (error instanceof ApiError)
        setActionError(error.message);
      else
        setActionError("Não foi possível alterar o status do pedido.");

      setShowCancelDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setIsLoading(true);
    setLoadError(null);
    setRetryKey(current => current + 1);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <LoadingState message="Carregando pedido..." />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState
            message={loadError ?? "Pedido não encontrado."}
            onRetry={handleRetry}
          />
        </div>

        <Button variant="secondary" onClick={() => void router.push("/orders")}>
          <ArrowLeft size={17} />
          Voltar para pedidos
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" className="-ml-3 mb-2" onClick={() => void router.push("/orders")}>
              <ArrowLeft size={17} />
              Voltar
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-text">Pedido #{order.id}</h2>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Hash size={15} />
                Pedido #{order.id}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} />
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {actionError && (
          <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            <AlertCircle size={18} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <OrderDetailsItems items={order.items} />

          <div className="space-y-6">
            <OrderFinancialSummary order={order} />

            <OrderStatusActions
              status={order.status}
              isSubmitting={isSubmitting}
              onProcess={() => void changeStatus(OrderStatus.Processing)}
              onComplete={() => void changeStatus(OrderStatus.Completed)}
              onCancel={() => setShowCancelDialog(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar pedido"
        description={`Tem certeza que deseja cancelar o pedido #${order.id}? O estoque dos produtos será restaurado automaticamente.`}
        confirmLabel="Cancelar pedido"
        isLoading={isSubmitting}
        onConfirm={() => void changeStatus(OrderStatus.Cancelled)}
        onCancel={() => setShowCancelDialog(false)}
      />
    </>
  );
}

function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Não foi possível se comunicar com a API.";
}
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowLeft, CalendarDays } from "lucide-react";

import OrderDetailsItems from "@/components/orders/OrderDetailsItems";
import OrderFinancialSummary from "@/components/orders/OrderFinancialSummary";
import OrderStatusActions from "@/components/orders/OrderStatusActions";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, isAbortError } from "@/lib/api/api-errors";
import { ApiError } from "@/lib/api/http-client";
import { ordersApi } from "@/lib/api/orders-api";
import { formatDateTime } from "@/lib/formatters";
import { OrderStatus, type Order } from "@/types/order";

type LoadError = {
  orderId: number;
  message: string;
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const orderId = getOrderId(router.query.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const getOrderRequest = useCallback((id: number, signal?: AbortSignal) => {
    return ordersApi.getById(id, { signal });
  }, []);

  useEffect(() => {
    if (!router.isReady || orderId === null)
      return;

    const controller = new AbortController();

    getOrderRequest(orderId, controller.signal)
      .then(result => {
        setOrder(result);
        setLoadError(null);
      })
      .catch(error => {
        if (isAbortError(error))
          return;

        setLoadError({ orderId, message: getApiErrorMessage(error) });
      });

    return () => controller.abort();
  }, [getOrderRequest, orderId, retryKey, router.isReady]);

  async function changeStatus(status: OrderStatus) {
    if (!order)
      return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const updatedOrder = await ordersApi.changeStatus(order.id, { status });
      setOrder(updatedOrder);
      setShowCancelDialog(false);

      showToast({
        title: getStatusSuccessMessage(status),
        variant: "success"
      });
    } catch (error) {
      setShowCancelDialog(false);

      if (error instanceof ApiError && error.status === 409) {
        setActionError("O pedido foi alterado por outra operação. Os dados foram atualizados.");
        await reloadOrder(order.id);
        return;
      }

      setActionError(getApiErrorMessage(error, "Não foi possível alterar o status do pedido."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    if (orderId === null)
      return;

    setOrder(null);
    setLoadError(null);
    setRetryKey(current => current + 1);
  }

  async function reloadOrder(id: number) {
    try {
      const result = await getOrderRequest(id);
      setOrder(result);
      setLoadError(null);
    } catch (error) {
      setLoadError({ orderId: id, message: getApiErrorMessage(error) });
    }
  }

  if (!router.isReady)
    return <OrderLoading />;

  if (orderId === null) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Não foi possível carregar o pedido"
          message="O identificador do pedido é inválido."
          actionLabel="Voltar para pedidos"
          actionIcon={<ArrowLeft size={17} />}
          onRetry={() => void router.push("/orders")}
        />
      </div>
    );
  }

  const currentLoadError = loadError?.orderId === orderId ? loadError.message : null;

  if (currentLoadError) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState
            title="Não foi possível carregar o pedido"
            message={currentLoadError}
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

  if (!order || order.id !== orderId)
    return <OrderLoading />;

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

function OrderLoading() {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <LoadingState message="Carregando pedido..." />
    </div>
  );
}

function getOrderId(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function getStatusSuccessMessage(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Processing:
      return "Pedido enviado para processamento.";
    case OrderStatus.Completed:
      return "Pedido concluído com sucesso.";
    case OrderStatus.Cancelled:
      return "Pedido cancelado e estoque restaurado.";
    default:
      return "Status do pedido atualizado com sucesso.";
  }
}

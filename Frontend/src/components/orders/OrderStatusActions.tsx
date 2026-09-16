import { CheckCircle2, LoaderCircle, Play, XCircle } from "lucide-react";

import Button from "@/components/ui/Button";
import { OrderStatus } from "@/types/order";

type OrderStatusActionsProps = {
  status: OrderStatus;
  isSubmitting: boolean;
  onProcess: () => void;
  onComplete: () => void;
  onCancel: () => void;
};

export default function OrderStatusActions({
  status,
  isSubmitting,
  onProcess,
  onComplete,
  onCancel
}: OrderStatusActionsProps) {
  if (status === OrderStatus.Completed || status === OrderStatus.Cancelled) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-semibold text-text">Ações</h2>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Este pedido está em um status final e não possui novas transições disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-text">Ações do pedido</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Atualize o pedido de acordo com o fluxo permitido.
        </p>
      </div>

      <div className="space-y-3 p-5">
        {status === OrderStatus.Pending && (
          <Button className="w-full" disabled={isSubmitting} onClick={onProcess}>
            {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <Play size={18} />}
            Iniciar processamento
          </Button>
        )}

        {status === OrderStatus.Processing && (
          <Button className="w-full" disabled={isSubmitting} onClick={onComplete}>
            {isSubmitting ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Concluir pedido
          </Button>
        )}

        <Button
          variant="danger"
          className="w-full"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          <XCircle size={18} />
          Cancelar pedido
        </Button>
      </div>
    </div>
  );
}
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import Button from "@/components/ui/Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  variant = "danger",
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen)
    return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isLoading)
          onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-text">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {description}
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-surface-secondary px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={variant}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading && <LoaderCircle size={17} className="animate-spin" />}
            {isLoading ? "Processando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
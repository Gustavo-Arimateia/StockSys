import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = ToastOptions & {
  id: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-success-soft text-success",
  error: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info"
};

let toastSequence = 0;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = ++toastSequence;
    const toast: ToastItem = {
      ...options,
      id,
      variant: options.variant ?? "success"
    };

    setToasts(current => [...current, toast]);

    window.setTimeout(() => {
      setToasts(current => current.filter(item => item.id !== id));
    }, options.duration ?? 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-4 top-20 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
          >
            <div className="flex items-start gap-3 p-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${variantClasses[toast.variant]}`}>
                <ToastIcon variant={toast.variant} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm leading-5 text-text-secondary">{toast.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-secondary hover:text-text"
                aria-label="Fechar notificação"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context)
    throw new Error("useToast deve ser usado dentro de ToastProvider.");

  return context;
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case "success":
      return <CheckCircle2 size={19} />;
    case "error":
      return <CircleAlert size={19} />;
    default:
      return <Info size={19} />;
  }
}

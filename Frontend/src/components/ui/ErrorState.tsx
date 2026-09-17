import type { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import Button from "./Button";

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onRetry: () => void;
};

export default function ErrorState({
  title = "Não foi possível carregar os dados",
  message,
  actionLabel = "Tentar novamente",
  actionIcon,
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <AlertCircle size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">{message}</p>

      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        {actionIcon ?? <RefreshCw size={17} />}
        {actionLabel}
      </Button>
    </div>
  );
}

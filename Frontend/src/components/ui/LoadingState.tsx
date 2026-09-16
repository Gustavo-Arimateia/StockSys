import { LoaderCircle } from "lucide-react";

type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3">
      <LoaderCircle size={28} className="animate-spin text-primary" />
      <span className="text-sm text-text-secondary">{message}</span>
    </div>
  );
}

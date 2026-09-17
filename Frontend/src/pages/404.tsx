import { Home, SearchX } from "lucide-react";
import { useRouter } from "next/router";

import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <SearchX size={28} />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-primary">Erro 404</p>
        <h2 className="mt-2 text-2xl font-bold text-text">Página não encontrada</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          A página que você tentou acessar não existe ou não está mais disponível.
        </p>

        <Button className="mt-6" onClick={() => void router.push("/dashboard")}>
          <Home size={17} />
          Voltar ao dashboard
        </Button>
      </div>
    </div>
  );
}

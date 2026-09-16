import { useRouter } from "next/router";
import { Plus } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Pedidos cadastrados</h2>
          <p className="mt-1 text-sm text-text-secondary">Consulte e gerencie os pedidos realizados.</p>
        </div>

        <Button className="shrink-0" onClick={() => void router.push("/orders/new")}>
          <Plus size={18} />
          Novo pedido
        </Button>
      </div>

      <Card>
        <Badge variant="warning">Em desenvolvimento</Badge>
        <p className="mt-3 text-sm text-text-secondary">A listagem de pedidos será implementada na próxima etapa.</p>
      </Card>
    </div>
  );
}

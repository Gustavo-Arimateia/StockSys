import { BarChart3 } from "lucide-react";

import Card from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <BarChart3 size={24} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-text">Dashboard</h2>

          <p className="mt-1 max-w-lg text-sm leading-6 text-text-secondary">
            A visão geral será concluída após a implementação dos pedidos, utilizando dados reais de produtos e pedidos.
          </p>
        </div>
      </Card>
    </div>
  );
}
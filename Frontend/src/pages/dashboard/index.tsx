import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ClipboardList,
  Clock3,
  PackageCheck,
  PackageX,
  RefreshCw
} from "lucide-react";

import DashboardBarChart from "@/components/dashboard/DashboardBarChart";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/http-client";
import { dashboardApi } from "@/lib/api/dashboard-api";
import type { DashboardSummary } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    dashboardApi.getSummary({ signal: controller.signal })
      .then(result => {
        setSummary(result);
        setError(null);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        setError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  function handleReload() {
    setIsLoading(true);
    setError(null);
    setReloadKey(current => current + 1);
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <LoadingState message="Carregando dashboard..." />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          message={error ?? "Não foi possível carregar o dashboard."}
          onRetry={handleReload}
        />
      </div>
    );
  }

  const orderChartItems = [
    {
      label: "Pendentes",
      value: summary.orders.pending,
      variant: "warning" as const
    },
    {
      label: "Em processamento",
      value: summary.orders.processing,
      variant: "info" as const
    },
    {
      label: "Concluídos",
      value: summary.orders.completed,
      variant: "success" as const
    },
    {
      label: "Cancelados",
      value: summary.orders.cancelled,
      variant: "danger" as const
    }
  ];

  const productChartItems = [
    {
      label: "Ativos",
      value: summary.products.active,
      variant: "success" as const
    },
    {
      label: "Inativos",
      value: summary.products.inactive,
      variant: "neutral" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Visão geral</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Acompanhe os principais indicadores de produtos e pedidos.
          </p>
        </div>

        <Button variant="secondary" onClick={handleReload}>
          <RefreshCw size={17} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Produtos ativos"
          value={summary.products.active}
          description={`${summary.products.total} produtos cadastrados`}
          icon={PackageCheck}
          variant="success"
        />

        <DashboardStatCard
          title="Produtos inativos"
          value={summary.products.inactive}
          description="Produtos indisponíveis para novos pedidos"
          icon={PackageX}
          variant="neutral"
        />

        <DashboardStatCard
          title="Pedidos"
          value={summary.orders.total}
          description="Total de pedidos cadastrados"
          icon={ClipboardList}
          variant="primary"
        />

        <DashboardStatCard
          title="Pedidos pendentes"
          value={summary.orders.pending}
          description="Aguardando processamento"
          icon={Clock3}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardBarChart
          title="Pedidos por status"
          description="Distribuição atual dos pedidos cadastrados."
          items={orderChartItems}
        />

        <DashboardBarChart
          title="Produtos por status"
          description="Distribuição entre produtos ativos e inativos."
          items={productChartItems}
        />
      </div>

      <RecentOrders
        orders={summary.recentOrders}
        onView={id => void router.push(`/orders/${id}`)}
        onViewAll={() => void router.push("/orders")}
      />
    </div>
  );
}

function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Não foi possível se comunicar com a API.";
}
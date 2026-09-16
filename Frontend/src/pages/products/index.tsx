import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Plus,
} from "lucide-react";

import ProductTable from "@/components/products/ProductTable";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";

import {
  ApiError,
} from "@/lib/api/http-client";

import {
  productsApi,
} from "@/lib/api/products-api";

import type {
  PagedResult,
} from "@/types/api";

import type {
  Product,
} from "@/types/product";

export default function ProductsPage() {
  const [
    productsResult,
    setProductsResult,
  ] = useState<PagedResult<Product> | null>(
    null,
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadProducts =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await productsApi.getAll({
            page: 1,
            pageSize: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          });

        setProductsResult(result);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Não foi possível se comunicar com a API.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="space-y-6">
      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h2 className="text-lg font-semibold text-text">
            Produtos cadastrados
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            {productsResult
              ? `${productsResult.totalItems} produto${
                  productsResult.totalItems ===
                  1
                    ? ""
                    : "s"
                } encontrado${
                  productsResult.totalItems ===
                  1
                    ? ""
                    : "s"
                }.`
              : "Consulte e gerencie os produtos do estoque."}
          </p>
        </div>

        <Button
          className="shrink-0"
          disabled
          title="Cadastro será implementado na próxima etapa"
        >
          <Plus size={18} />

          Novo produto
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-surface">
          <LoadingState message="Carregando produtos..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState
            message={error}
            onRetry={loadProducts}
          />
        </div>
      ) : !productsResult ||
        productsResult.items.length ===
          0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Quando você cadastrar o primeiro produto, ele aparecerá nesta lista."
          />
        </div>
      ) : (
        <ProductTable
          products={
            productsResult.items
          }
        />
      )}
    </div>
  );
}
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";

import ProductFilters, { type ProductSortOption, type ProductStatusFilter } from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import Pagination from "@/components/ui/Pagination";
import { ApiError } from "@/lib/api/http-client";
import { productsApi } from "@/lib/api/products-api";
import type { PagedResult } from "@/types/api";
import type { Product } from "@/types/product";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const router = useRouter();

  const [productsResult, setProductsResult] = useState<PagedResult<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [sort, setSort] = useState<ProductSortOption>("createdAt:desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"];

      const result = await productsApi.getAll({
        page,
        pageSize: PAGE_SIZE,
        name: search || undefined,
        isActive: status === "all" ? undefined : status === "active",
        sortBy,
        sortDirection
      }, { signal });

      setProductsResult(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return;

      if (error instanceof ApiError)
        setError(error.message);
      else
        setError("Não foi possível se comunicar com a API.");
    } finally {
      if (!signal?.aborted)
        setIsLoading(false);
    }
  }, [page, search, status, sort]);

  useEffect(() => {
    const controller = new AbortController();

    void loadProducts(controller.signal);

    return () => controller.abort();
  }, [loadProducts]);

  function handleStatusChange(value: ProductStatusFilter) {
    setPage(1);
    setStatus(value);
  }

  function handleSortChange(value: ProductSortOption) {
    setPage(1);
    setSort(value);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  const hasFilters = search.length > 0 || status !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Produtos cadastrados</h2>

          <p className="mt-1 text-sm text-text-secondary">
            {productsResult
              ? `${productsResult.totalItems} ${productsResult.totalItems === 1 ? "produto encontrado" : "produtos encontrados"}.`
              : "Consulte e gerencie os produtos do estoque."}
          </p>
        </div>

        <Button className="shrink-0" onClick={() => void router.push("/products/new")}>
          <Plus size={18} />
          Novo produto
        </Button>
      </div>

      <ProductFilters
        search={searchInput}
        status={status}
        sort={sort}
        onSearchChange={setSearchInput}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
      />

      {isLoading ? (
        <div className="rounded-xl border border-border bg-surface">
          <LoadingState message="Carregando produtos..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState message={error} onRetry={() => void loadProducts()} />
        </div>
      ) : !productsResult || productsResult.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <EmptyState
            title={hasFilters ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            description={
              hasFilters
                ? "Tente alterar os filtros ou buscar por outro nome."
                : "Quando você cadastrar o primeiro produto, ele aparecerá nesta lista."
            }
          />
        </div>
      ) : (
        <>
          <ProductTable products={productsResult.items} />

          <Pagination
            page={productsResult.page}
            pageSize={productsResult.pageSize}
            totalItems={productsResult.totalItems}
            totalPages={productsResult.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
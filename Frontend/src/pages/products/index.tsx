import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AlertCircle, Plus } from "lucide-react";

import ProductFilters, { type ProductSortOption, type ProductStatusFilter } from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, isAbortError } from "@/lib/api/api-errors";
import { productsApi } from "@/lib/api/products-api";
import type { PagedResult } from "@/types/api";
import type { Product } from "@/types/product";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [productsResult, setProductsResult] = useState<PagedResult<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [sort, setSort] = useState<ProductSortOption>("createdAt:desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [changingProductId, setChangingProductId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      if (nextSearch === search)
        return;

      setPage(1);
      setIsLoading(true);
      setError(null);
      setSearch(nextSearch);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, search]);

  const getProductsRequest = useCallback((signal?: AbortSignal) => {
    const [sortBy, sortDirection] = sort.split(":") as [string, "asc" | "desc"];

    return productsApi.getAll({
      page,
      pageSize: PAGE_SIZE,
      name: search || undefined,
      isActive: status === "all" ? undefined : status === "active",
      sortBy,
      sortDirection
    }, { signal });
  }, [page, search, status, sort]);

  useEffect(() => {
    const controller = new AbortController();

    getProductsRequest(controller.signal)
      .then(result => {
        setProductsResult(result);
        setError(null);
      })
      .catch(error => {
        if (isAbortError(error))
          return;

        setError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setIsLoading(false);
      });

    return () => controller.abort();
  }, [getProductsRequest, retryKey]);

  function handleStatusChange(value: ProductStatusFilter) {
    setPage(1);
    setStatus(value);
    prepareReload();
  }

  function handleSortChange(value: ProductSortOption) {
    setPage(1);
    setSort(value);
    prepareReload();
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    prepareReload();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function handleRetry() {
    prepareReload();
    setRetryKey(current => current + 1);
  }

  function handleToggleStatus(product: Product) {
    if (product.isActive) {
      setProductToDeactivate(product);
      return;
    }

    void changeProductStatus(product);
  }

  async function handleConfirmDeactivate() {
    if (!productToDeactivate)
      return;

    await changeProductStatus(productToDeactivate);
  }

  async function changeProductStatus(product: Product) {
    try {
      setChangingProductId(product.id);
      setActionError(null);

      if (product.isActive)
        await productsApi.deactivate(product.id);
      else
        await productsApi.activate(product.id);

      setProductToDeactivate(null);

      showToast({
        title: product.isActive ? "Produto inativado com sucesso." : "Produto ativado com sucesso.",
        variant: "success"
      });

      const leavesCurrentFilter =
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      if (leavesCurrentFilter && productsResult?.items.length === 1 && page > 1) {
        setIsLoading(true);
        setPage(current => current - 1);
      } else {
        await reloadProducts();
      }
    } catch (error) {
      setProductToDeactivate(null);
      setActionError(getApiErrorMessage(error, "Não foi possível alterar o status do produto."));
    } finally {
      setChangingProductId(null);
    }
  }

  async function reloadProducts() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getProductsRequest();
      setProductsResult(result);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function prepareReload() {
    setIsLoading(true);
    setError(null);
    setActionError(null);
  }

  const hasFilters = search.length > 0 || status !== "all";

  return (
    <>
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

        {actionError && (
          <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            <AlertCircle size={18} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-border bg-surface">
            <LoadingState message="Carregando produtos..." />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-surface">
            <ErrorState message={error} onRetry={handleRetry} />
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
            <ProductTable
              products={productsResult.items}
              changingProductId={changingProductId}
              onEdit={id => void router.push(`/products/${id}/edit`)}
              onToggleStatus={handleToggleStatus}
            />

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

      <ConfirmDialog
        isOpen={productToDeactivate !== null}
        title="Inativar produto"
        description={
          productToDeactivate
            ? `Tem certeza que deseja inativar o produto "${productToDeactivate.name}"? Produtos inativos não poderão ser utilizados em novos pedidos.`
            : ""
        }
        confirmLabel="Inativar produto"
        isLoading={changingProductId === productToDeactivate?.id}
        onConfirm={() => void handleConfirmDeactivate()}
        onCancel={() => setProductToDeactivate(null)}
      />
    </>
  );
}

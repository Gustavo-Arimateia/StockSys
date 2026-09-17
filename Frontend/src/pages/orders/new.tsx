import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import { AlertCircle, Plus, ShoppingCart } from "lucide-react";

import OrderItemsTable, { type OrderDraftItem } from "@/components/orders/OrderItemsTable";
import OrderSummary from "@/components/orders/OrderSummary";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, isAbortError } from "@/lib/api/api-errors";
import { ordersApi } from "@/lib/api/orders-api";
import { productsApi } from "@/lib/api/products-api";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/types/product";

const PRODUCTS_PAGE_SIZE = 100;

export default function NewOrderPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const idempotencyKeyRef = useRef<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<OrderDraftItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    loadActiveProducts(controller.signal)
      .then(result => {
        setProducts(result);
        setLoadError(null);
      })
      .catch(error => {
        if (isAbortError(error))
          return;

        setLoadError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted)
          setIsLoadingProducts(false);
      });

    return () => controller.abort();
  }, [retryKey]);

  function handleRetryProducts() {
    setIsLoadingProducts(true);
    setLoadError(null);
    setRetryKey(current => current + 1);
  }

  function handleAddProduct() {
    const productId = Number(selectedProductId);
    const product = products.find(item => item.id === productId);

    if (!product)
      return;

    if (product.stockQuantity <= 0) {
      setSubmitError("O produto selecionado não possui estoque disponível.");
      return;
    }

    if (items.some(item => item.productId === product.id)) {
      setSubmitError("Este produto já foi adicionado ao pedido.");
      return;
    }

    setItems(current => [
      ...current,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        stockQuantity: product.stockQuantity,
        quantity: 1
      }
    ]);

    setSelectedProductId("");
    setSubmitError(null);
    invalidateIdempotencyKey();
  }

  function handleQuantityChange(productId: number, quantity: number) {
    setItems(current =>
      current.map(item => {
        if (item.productId !== productId)
          return item;

        const nextQuantity = Number.isFinite(quantity)
          ? Math.min(Math.max(quantity, 1), item.stockQuantity)
          : 1;

        return {
          ...item,
          quantity: nextQuantity
        };
      })
    );

    setSubmitError(null);
    invalidateIdempotencyKey();
  }

  function handleRemoveProduct(productId: number) {
    setItems(current => current.filter(item => item.productId !== productId));
    setSubmitError(null);
    invalidateIdempotencyKey();
  }

  function handleDiscountChange(value: string) {
    setDiscountPercentage(value);
    setSubmitError(null);
    invalidateIdempotencyKey();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setSubmitError("Adicione pelo menos um produto ao pedido.");
      return;
    }

    const discount = Number(discountPercentage);

    if (!Number.isFinite(discount) || discount < 0 || discount > 20) {
      setSubmitError("O desconto deve estar entre 0% e 20%.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const idempotencyKey = idempotencyKeyRef.current ?? crypto.randomUUID();
      idempotencyKeyRef.current = idempotencyKey;

      const order = await ordersApi.create({
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        discountPercentage: discount
      }, idempotencyKey);

      showToast({
        title: `Pedido #${order.id} criado com sucesso.`,
        variant: "success"
      });

      await router.push(`/orders/${order.id}`);
    } catch (error) {
      setSubmitError(getApiErrorMessage(
        error,
        "Não foi possível criar o pedido. Verifique sua conexão e tente novamente."
      ));
    } finally {
      setIsSubmitting(false);
    }
  }

  function invalidateIdempotencyKey() {
    idempotencyKeyRef.current = null;
  }

  const parsedDiscount = Number(discountPercentage);
  const isDiscountValid = Number.isFinite(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 20;
  const discount = isDiscountValid ? parsedDiscount : 0;
  const discountError = isDiscountValid ? null : "O desconto deve estar entre 0% e 20%.";
  const productsValue = roundCurrency(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
  const discountValue = roundCurrency(productsValue * discount / 100);
  const totalValue = roundCurrency(productsValue - discountValue);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-text">Produtos do pedido</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Selecione produtos ativos e informe as quantidades desejadas.
            </p>
          </div>

          <div className="p-5">
            {isLoadingProducts ? (
              <LoadingState message="Carregando produtos..." />
            ) : loadError ? (
              <ErrorState message={loadError} onRetry={handleRetryProducts} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Nenhum produto disponível"
                description="Cadastre ou ative um produto com estoque para criar um pedido."
              />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedProductId}
                  disabled={isSubmitting}
                  onChange={event => setSelectedProductId(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  aria-label="Selecione um produto"
                >
                  <option value="">Selecione um produto...</option>

                  {products.map(product => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={product.stockQuantity === 0 || items.some(item => item.productId === product.id)}
                    >
                      {product.name} — {formatCurrency(product.price)} — Estoque: {product.stockQuantity}
                    </option>
                  ))}
                </select>

                <Button
                  variant="secondary"
                  disabled={!selectedProductId || isSubmitting}
                  onClick={handleAddProduct}
                >
                  <Plus size={17} />
                  Adicionar
                </Button>
              </div>
            )}
          </div>
        </section>

        {submitError && (
          <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            <AlertCircle size={18} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum produto adicionado"
              description="Selecione um produto acima para começar a montar o pedido."
            />
          </div>
        ) : (
          <OrderItemsTable
            items={items}
            disabled={isSubmitting}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveProduct}
          />
        )}
      </div>

      <div className="lg:sticky lg:top-[100px] lg:self-start">
        <OrderSummary
          productsValue={productsValue}
          discountPercentage={discountPercentage}
          discountValue={discountValue}
          totalValue={totalValue}
          discountError={discountError}
          isSubmitting={isSubmitting}
          canSubmit={items.length > 0 && isDiscountValid}
          onDiscountChange={handleDiscountChange}
          onCancel={() => void router.push("/orders")}
        />
      </div>
    </form>
  );
}

async function loadActiveProducts(signal: AbortSignal): Promise<Product[]> {
  const products: Product[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await productsApi.getAll({
      page,
      pageSize: PRODUCTS_PAGE_SIZE,
      isActive: true,
      sortBy: "name",
      sortDirection: "asc"
    }, { signal });

    products.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  return products;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

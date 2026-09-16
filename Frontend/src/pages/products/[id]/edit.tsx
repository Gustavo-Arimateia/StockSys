import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import ProductForm, { type ProductFormData } from "@/components/products/ProductForm";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/http-client";
import { productsApi } from "@/lib/api/products-api";
import type { Product } from "@/types/product";

export default function EditProductPage() {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const loadProduct = useCallback(async (signal?: AbortSignal) => {
    if (!router.isReady)
      return;

    const rawId = router.query.id;
    const productId = Number(Array.isArray(rawId) ? rawId[0] : rawId);

    if (!Number.isInteger(productId) || productId <= 0) {
      setLoadError("O identificador do produto é inválido.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const result = await productsApi.getById(productId, { signal });
      setProduct(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return;

      if (error instanceof ApiError)
        setLoadError(error.message);
      else
        setLoadError("Não foi possível se comunicar com a API.");
    } finally {
      if (!signal?.aborted)
        setIsLoading(false);
    }
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    const controller = new AbortController();

    void loadProduct(controller.signal);

    return () => controller.abort();
  }, [loadProduct]);

  async function handleSubmit(data: ProductFormData) {
    if (!product)
      return;

    try {
      setIsSubmitting(true);
      setServerError(null);

      await productsApi.update(product.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        stockQuantity: data.stockQuantity
      });

      await router.push("/products");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.errors?.length ? error.errors.join(" ") : error.message);
        return;
      }

      setServerError("Não foi possível atualizar o produto. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <LoadingState message="Carregando produto..." />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState
            title="Não foi possível carregar o produto"
            message={loadError ?? "Produto não encontrado."}
            onRetry={() => void loadProduct()}
          />
        </div>

        <Button variant="secondary" onClick={() => void router.push("/products")}>
          Voltar para produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm
        initialValues={{
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            stockQuantity: String(product.stockQuantity)
        }}
        formDescription="Altere os dados necessários e salve as alterações."
        submitLabel="Salvar alterações"
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => void router.push("/products")}
        />
    </div>
  );
}
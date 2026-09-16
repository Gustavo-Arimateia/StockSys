import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import ProductForm, { type ProductFormData } from "@/components/products/ProductForm";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { ApiError } from "@/lib/api/http-client";
import { productsApi } from "@/lib/api/products-api";
import type { Product } from "@/types/product";

type LoadError = {
  productId: number;
  message: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const productId = getProductId(router.query.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const getProductRequest = useCallback((id: number, signal?: AbortSignal) => {
    return productsApi.getById(id, { signal });
  }, []);

  useEffect(() => {
    if (!router.isReady || productId === null)
      return;

    const controller = new AbortController();

    getProductRequest(productId, controller.signal)
      .then(result => {
        setProduct(result);
        setLoadError(null);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;

        setLoadError({ productId, message: getApiErrorMessage(error) });
      });

    return () => controller.abort();
  }, [getProductRequest, productId, router.isReady]);

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
        stockQuantity: data.stockQuantity,
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

  function handleRetry() {
    if (productId === null)
      return;

    setProduct(null);
    setLoadError(null);
    void reloadProduct(productId);
  }


  async function reloadProduct(id: number) {
    try {
      const result = await getProductRequest(id);
      setProduct(result);
      setLoadError(null);
    } catch (error) {
      setLoadError({ productId: id, message: getApiErrorMessage(error) });
    }
  }

  if (!router.isReady)
    return <ProductLoading />;

  if (productId === null) {
    return (
      <ProductLoadError
        message="O identificador do produto é inválido."
        onRetry={() => void router.push("/products")}
        retryLabel="Voltar para produtos"
      />
    );
  }

  const currentLoadError = loadError?.productId === productId ? loadError.message : null;

  if (currentLoadError)
    return <ProductLoadError message={currentLoadError} onRetry={handleRetry} />;

  if (!product || product.id !== productId)
    return <ProductLoading />;

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm
        initialValues={{
          name: product.name,
          description: product.description ?? "",
          price: String(product.price),
          stockQuantity: String(product.stockQuantity),
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

function ProductLoading() {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <LoadingState message="Carregando produto..." />
    </div>
  );
}

type ProductLoadErrorProps = {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
};

function ProductLoadError({ message, onRetry, retryLabel }: ProductLoadErrorProps) {
  if (retryLabel) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface">
          <ErrorState title="Não foi possível carregar o produto" message={message} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState title="Não foi possível carregar o produto" message={message} onRetry={onRetry} />
      </div>

      <Button variant="secondary" onClick={() => window.history.back()}>
        Voltar
      </Button>
    </div>
  );
}

function getProductId(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Não foi possível se comunicar com a API.";
}

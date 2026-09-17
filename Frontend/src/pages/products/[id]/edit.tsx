import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import ProductForm, { type ProductFormData } from "@/components/products/ProductForm";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage, isAbortError } from "@/lib/api/api-errors";
import { productsApi } from "@/lib/api/products-api";
import type { Product } from "@/types/product";

type LoadError = {
  productId: number;
  message: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
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
        if (isAbortError(error))
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
        stockQuantity: data.stockQuantity
      });

      showToast({
        title: "Produto atualizado com sucesso.",
        variant: "success"
      });

      await router.push("/products");
    } catch (error) {
      setServerError(getApiErrorMessage(
        error,
        "Não foi possível atualizar o produto. Verifique sua conexão e tente novamente."
      ));
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
        actionLabel="Voltar para produtos"
        actionIcon={<ArrowLeft size={17} />}
        onAction={() => void router.push("/products")}
      />
    );
  }

  const currentLoadError = loadError?.productId === productId ? loadError.message : null;

  if (currentLoadError)
    return <ProductLoadError message={currentLoadError} onAction={handleRetry} />;

  if (!product || product.id !== productId)
    return <ProductLoading />;

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm
        initialValues={{
          name: product.name,
          description: product.description,
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

function ProductLoading() {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <LoadingState message="Carregando produto..." />
    </div>
  );
}

type ProductLoadErrorProps = {
  message: string;
  onAction: () => void;
  actionLabel?: string;
  actionIcon?: ReactNode;
};

function ProductLoadError({ message, onAction, actionLabel, actionIcon }: ProductLoadErrorProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Não foi possível carregar o produto"
          message={message}
          actionLabel={actionLabel}
          actionIcon={actionIcon}
          onRetry={onAction}
        />
      </div>

      {!actionLabel && (
        <Button variant="secondary" onClick={() => window.history.back()}>
          Voltar
        </Button>
      )}
    </div>
  );
}

function getProductId(value: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);

  return Number.isInteger(id) && id > 0 ? id : null;
}

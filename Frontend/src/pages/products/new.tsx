import { useState } from "react";
import { useRouter } from "next/router";

import ProductForm, { type ProductFormData } from "@/components/products/ProductForm";
import { useToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage } from "@/lib/api/api-errors";
import { productsApi } from "@/lib/api/products-api";

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: ProductFormData) {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await productsApi.create({
        name: data.name,
        description: data.description,
        price: data.price,
        stockQuantity: data.stockQuantity
      });

      showToast({
        title: "Produto cadastrado com sucesso.",
        variant: "success"
      });

      await router.push("/products");
    } catch (error) {
      setServerError(getApiErrorMessage(
        error,
        "Não foi possível cadastrar o produto. Verifique sua conexão e tente novamente."
      ));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ProductForm
        formDescription="Informe os dados necessários para o cadastro."
        submitLabel="Cadastrar produto"
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => void router.push("/products")}
      />
    </div>
  );
}

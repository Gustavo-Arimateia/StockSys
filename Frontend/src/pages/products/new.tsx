import { useState } from "react";
import { useRouter } from "next/router";

import ProductForm, { type ProductFormData } from "@/components/products/ProductForm";
import { ApiError } from "@/lib/api/http-client";
import { productsApi } from "@/lib/api/products-api";

export default function NewProductPage() {
  const router = useRouter();

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
        stockQuantity: data.stockQuantity,
      });

      await router.push("/products");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.errors?.length ? error.errors.join(" ") : error.message);
        return;
      }

      setServerError("Não foi possível cadastrar o produto. Verifique sua conexão e tente novamente.");
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

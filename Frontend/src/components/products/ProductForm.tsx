import {
  FormEvent,
  useState,
} from "react";

import {
  AlertCircle,
  LoaderCircle,
  Save,
} from "lucide-react";

import Button from "@/components/ui/Button";

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
};

export type ProductFormInitialValues = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
};

type ProductFormProps = {
  initialValues?: ProductFormInitialValues;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;

  onSubmit: (
    data: ProductFormData,
  ) => Promise<void>;

  onCancel: () => void;
};

type FormErrors = Partial<
  Record<
    keyof ProductFormInitialValues,
    string
  >
>;

const EMPTY_VALUES: ProductFormInitialValues =
  {
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
  };

export default function ProductForm({
  initialValues = EMPTY_VALUES,
  submitLabel = "Salvar produto",
  isSubmitting = false,
  serverError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] =
    useState<ProductFormInitialValues>(
      initialValues,
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  function updateField(
    field: keyof ProductFormInitialValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationErrors =
      validateProduct(values);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),

      description:
        values.description.trim(),

      price: Number(
        values.price,
      ),

      stockQuantity: Number(
        values.stockQuantity,
      ),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        overflow-hidden
        rounded-xl
        border border-border
        bg-surface
        shadow-sm
      "
    >
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold text-text">
          Dados do produto
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Informe os dados necessários
          para cadastrar o produto.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {serverError && (
          <div
            className="
              flex gap-3
              rounded-lg
              border border-danger/20
              bg-danger-soft
              p-4
              text-sm
              text-danger
            "
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {serverError}
            </span>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel
              htmlFor="name"
              required
            >
              Nome
            </FieldLabel>

            <input
              id="name"
              type="text"
              value={values.name}
              maxLength={120}
              disabled={isSubmitting}
              autoFocus
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              className={getInputClasses(
                Boolean(errors.name),
              )}
              placeholder="Ex.: Notebook Dell Inspiron"
            />

            <FieldError
              message={errors.name}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="description">
                Descrição
              </FieldLabel>

              <span className="text-xs text-text-muted">
                {
                  values.description
                    .length
                }
                /500
              </span>
            </div>

            <textarea
              id="description"
              value={
                values.description
              }
              maxLength={500}
              disabled={isSubmitting}
              rows={4}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              className={`
                ${getInputClasses(
                  Boolean(
                    errors.description,
                  ),
                )}
                resize-none py-2.5
              `}
              placeholder="Descrição opcional do produto"
            />

            <FieldError
              message={
                errors.description
              }
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="price"
              required
            >
              Preço
            </FieldLabel>

            <div className="relative">
              <span
                className="
                  pointer-events-none
                  absolute left-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-text-secondary
                "
              >
                R$
              </span>

              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={values.price}
                disabled={
                  isSubmitting
                }
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value,
                  )
                }
                className={`
                  ${getInputClasses(
                    Boolean(
                      errors.price,
                    ),
                  )}
                  pl-10
                `}
                placeholder="0,00"
              />
            </div>

            <FieldError
              message={errors.price}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="stockQuantity"
              required
            >
              Estoque inicial
            </FieldLabel>

            <input
              id="stockQuantity"
              type="number"
              min="0"
              step="1"
              value={
                values.stockQuantity
              }
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  "stockQuantity",
                  event.target.value,
                )
              }
              className={getInputClasses(
                Boolean(
                  errors.stockQuantity,
                ),
              )}
              placeholder="0"
            />

            <FieldError
              message={
                errors.stockQuantity
              }
            />
          </div>
        </div>
      </div>

      <div
        className="
          flex flex-col-reverse
          gap-3
          border-t border-border
          bg-surface-secondary
          px-6 py-4
          sm:flex-row
          sm:justify-end
        "
      >
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              Salvando...
            </>
          ) : (
            <>
              <Save size={18} />

              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function validateProduct(
  values: ProductFormInitialValues,
): FormErrors {
  const errors: FormErrors = {};

  const name =
    values.name.trim();

  if (!name) {
    errors.name =
      "Informe o nome do produto.";
  } else if (
    name.length > 120
  ) {
    errors.name =
      "O nome deve possuir no máximo 120 caracteres.";
  }

  if (
    values.description.length >
    500
  ) {
    errors.description =
      "A descrição deve possuir no máximo 500 caracteres.";
  }

  if (!values.price.trim()) {
    errors.price =
      "Informe o preço do produto.";
  } else {
    const price =
      Number(values.price);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      errors.price =
        "O preço deve ser maior que zero.";
    }
  }

  if (
    !values.stockQuantity.trim()
  ) {
    errors.stockQuantity =
      "Informe o estoque inicial.";
  } else {
    const stockQuantity =
      Number(
        values.stockQuantity,
      );

    if (
      !Number.isInteger(
        stockQuantity,
      ) ||
      stockQuantity < 0
    ) {
      errors.stockQuantity =
        "O estoque deve ser um número inteiro maior ou igual a zero.";
    }
  }

  return errors;
}

function FieldLabel({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="
        mb-1.5 block
        text-sm font-medium
        text-text
      "
    >
      {children}

      {required && (
        <span
          className="ml-1 text-danger"
          aria-hidden="true"
        >
          *
        </span>
      )}
    </label>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  );
}

function getInputClasses(
  hasError: boolean,
): string {
  return `
    h-10 w-full
    rounded-lg
    border
    bg-surface
    px-3
    text-sm text-text
    outline-none
    transition
    placeholder:text-text-muted
    disabled:cursor-not-allowed
    disabled:bg-surface-secondary
    disabled:opacity-70

    ${
      hasError
        ? `
          border-danger
          focus:ring-2
          focus:ring-danger/10
        `
        : `
          border-border
          focus:border-primary
          focus:ring-2
          focus:ring-primary/10
        `
    }
  `;
}
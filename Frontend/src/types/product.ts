export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
};

export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
};

export type UpdateProductRequest = {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
};

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};
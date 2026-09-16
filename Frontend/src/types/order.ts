export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Cancelled = 4,
}

export type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  productsValue: number;
  discountPercentage: number;
  discountValue: number;
  totalValue: number;
  items: OrderItem[];
};

export type OrderSummary = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  productsValue: number;
  discountPercentage: number;
  discountValue: number;
  totalValue: number;
};

export type CreateOrderItemRequest = {
  productId: number;
  quantity: number;
};

export type CreateOrderRequest = {
  items: CreateOrderItemRequest[];
  discountPercentage: number;
};

export type ChangeOrderStatusRequest = {
  status: OrderStatus;
};

export type OrderListParams = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};
import type { OrderSummary } from "@/types/order";

export type DashboardSummary = {
  products: {
    total: number;
    active: number;
    inactive: number;
  };

  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };

  recentOrders: OrderSummary[];
};
import { ordersApi } from "@/lib/api/orders-api";
import { productsApi } from "@/lib/api/products-api";
import type { DashboardSummary } from "@/types/dashboard";
import { OrderStatus } from "@/types/order";

export const dashboardApi = {
  async getSummary(options?: RequestInit): Promise<DashboardSummary> {
    const [
      activeProducts,
      inactiveProducts,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      recentOrders
    ] = await Promise.all([
      productsApi.getAll({
        page: 1,
        pageSize: 1,
        isActive: true
      }, options),

      productsApi.getAll({
        page: 1,
        pageSize: 1,
        isActive: false
      }, options),

      ordersApi.getAll({
        page: 1,
        pageSize: 1,
        status: OrderStatus.Pending
      }, options),

      ordersApi.getAll({
        page: 1,
        pageSize: 1,
        status: OrderStatus.Processing
      }, options),

      ordersApi.getAll({
        page: 1,
        pageSize: 1,
        status: OrderStatus.Completed
      }, options),

      ordersApi.getAll({
        page: 1,
        pageSize: 1,
        status: OrderStatus.Cancelled
      }, options),

      ordersApi.getAll({
        page: 1,
        pageSize: 5,
        sortBy: "createdAt",
        sortDirection: "desc"
      }, options)
    ]);

    const active = activeProducts.totalItems;
    const inactive = inactiveProducts.totalItems;

    const pending = pendingOrders.totalItems;
    const processing = processingOrders.totalItems;
    const completed = completedOrders.totalItems;
    const cancelled = cancelledOrders.totalItems;

    return {
      products: {
        total: active + inactive,
        active,
        inactive
      },

      orders: {
        total: pending + processing + completed + cancelled,
        pending,
        processing,
        completed,
        cancelled
      },

      recentOrders: recentOrders.items
    };
  }
};
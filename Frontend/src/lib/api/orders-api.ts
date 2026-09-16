import {
  buildQueryString,
  httpClient,
} from "./http-client";

import type {
  PagedResult,
} from "@/types/api";

import type {
  ChangeOrderStatusRequest,
  CreateOrderRequest,
  Order,
  OrderListParams,
  OrderSummary,
} from "@/types/order";

const BASE_PATH = "/api/orders";

export const ordersApi = {
  getById(
    id: number,
  ): Promise<Order> {
    return httpClient.get<Order>(
      `${BASE_PATH}/${id}`,
    );
  },

  getAll(
    params: OrderListParams = {},
  ): Promise<PagedResult<OrderSummary>> {
    const query =
      buildQueryString({
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
        sortBy: params.sortBy,
        sortDirection:
          params.sortDirection,
      });

    return httpClient.get<
      PagedResult<OrderSummary>
    >(`${BASE_PATH}${query}`);
  },

  create(
    request: CreateOrderRequest,
    idempotencyKey: string,
  ): Promise<Order> {
    return httpClient.post<Order>(
      BASE_PATH,
      request,
      {
        headers: {
          "Idempotency-Key":
            idempotencyKey,
        },
      },
    );
  },

  changeStatus(
    id: number,
    request: ChangeOrderStatusRequest,
  ): Promise<Order> {
    return httpClient.patch<Order>(
      `${BASE_PATH}/${id}/status`,
      request,
    );
  },
};
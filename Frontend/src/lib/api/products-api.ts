import {
  buildQueryString,
  httpClient,
} from "./http-client";

import type {
  PagedResult,
} from "@/types/api";

import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  UpdateProductRequest,
} from "@/types/product";

const BASE_PATH = "/api/products";

export const productsApi = {
  getById(
    id: number,
  ): Promise<Product> {
    return httpClient.get<Product>(
      `${BASE_PATH}/${id}`,
    );
  },

  getAll(
    params: ProductListParams = {},
  ): Promise<PagedResult<Product>> {
    const query =
      buildQueryString({
        page: params.page,
        pageSize: params.pageSize,
        name: params.name,
        isActive: params.isActive,
        sortBy: params.sortBy,
        sortDirection:
          params.sortDirection,
      });

    return httpClient.get<
      PagedResult<Product>
    >(`${BASE_PATH}${query}`);
  },

  create(
    request: CreateProductRequest,
  ): Promise<Product> {
    return httpClient.post<Product>(
      BASE_PATH,
      request,
    );
  },

  update(
    id: number,
    request: UpdateProductRequest,
  ): Promise<Product> {
    return httpClient.put<Product>(
      `${BASE_PATH}/${id}`,
      request,
    );
  },

  activate(
    id: number,
  ): Promise<Product> {
    return httpClient.patch<Product>(
      `${BASE_PATH}/${id}/activate`,
    );
  },

  deactivate(
    id: number,
  ): Promise<Product> {
    return httpClient.patch<Product>(
      `${BASE_PATH}/${id}/deactivate`,
    );
  },
};
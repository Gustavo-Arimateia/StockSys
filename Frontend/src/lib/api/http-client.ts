import type { ApiErrorResponse } from "@/types/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors?: string[] | null;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);

    this.name = "ApiError";
    this.status = status;
    this.code = response.code;
    this.errors = response.errors;
  }
}

type HttpOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept"))
    headers.set("Accept", "application/json");

  if (options.body !== undefined && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok)
    throw await createApiError(response);

  if (response.status === 204)
    return undefined as T;

  const text = await response.text();

  if (!text)
    return undefined as T;

  return JSON.parse(text) as T;
}

async function createApiError(response: Response): Promise<ApiError> {
  try {
    const errorResponse = await response.json() as ApiErrorResponse;
    return new ApiError(response.status, errorResponse);
  } catch {
    return new ApiError(response.status, {
      message: "Ocorreu um erro ao processar a requisição.",
      code: "UNEXPECTED_ERROR"
    });
  }
}

export const httpClient = {
  get<T>(path: string, options?: RequestInit) {
    return http<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestInit) {
    return http<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body?: unknown, options?: RequestInit) {
    return http<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestInit) {
    return http<T>(path, { ...options, method: "PATCH", body });
  }
};

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "")
      return;

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

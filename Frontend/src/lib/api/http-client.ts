import type { ApiErrorResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL)
  throw new Error("NEXT_PUBLIC_API_URL não está configurada.");

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
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorResponse: ApiErrorResponse;

    try {
      errorResponse = await response.json();
    } catch {
      errorResponse = {
        message: "Ocorreu um erro ao processar a requisição.",
        code: "UNEXPECTED_ERROR",
      };
    }

    throw new ApiError(response.status, errorResponse);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0")
    return undefined as T;

  return response.json() as Promise<T>;
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
  },
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

import { ApiError } from "./http-client";

const DEFAULT_API_ERROR_MESSAGE = "Não foi possível se comunicar com a API.";

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function getApiErrorMessage(error: unknown, fallback = DEFAULT_API_ERROR_MESSAGE): string {
  if (!(error instanceof ApiError))
    return fallback;

  if (error.errors?.length)
    return error.errors.join(" ");

  return error.message;
}

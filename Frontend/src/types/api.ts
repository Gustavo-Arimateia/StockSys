export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ApiErrorResponse = {
  message: string;
  code: string;
  errors?: string[] | null;
};
export interface AsyncState {
  isLoading: boolean;
  error: string | null;
  retryCallback: (() => void) | null;
}

export interface PaginationLinks {
  self: string | null;
  first: string | null;
  prev: string | null;
  next: string | null;
  last: string | null;
}

export interface PaginatedState {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links: PaginationLinks | null;
}

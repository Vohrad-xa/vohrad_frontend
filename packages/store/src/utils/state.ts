export interface AsyncState {
  isLoading: boolean;
  error: string | null;
  retryCallback: (() => void) | null;
}

export interface PaginatedState {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

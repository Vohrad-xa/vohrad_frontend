export interface AsyncState {
  isLoading: boolean;
  error: string | null;
  retryCallback: (() => void) | null;
}

export interface PaginatedState {
  limit: number;
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

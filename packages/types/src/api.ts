export type CursorDirection = 'before' | 'after';

export type CursorOrder = 'asc' | 'desc';

export interface ApiResponseMetadata {
  timestamp?: string;
  correlation_id?: string;
  request_id?: string;
  api_version?: string;
  method?: string;
  url?: string;
  client_ip?: string | null;
  user_agent?: string | null;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  metadata?: ApiResponseMetadata;
}

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  total_count?: number;
  start_cursor: string | null;
  end_cursor: string | null;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

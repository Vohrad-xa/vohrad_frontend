export interface BaseCredentials {
  email: string;
  password: string;
}
export interface UserLoginRequest extends BaseCredentials {
  tenant_id?: string;
}

export type AdminLoginRequest = BaseCredentials;

export interface RefreshTokenRequest {
  refresh_token?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface PaginationLinks {
  self: string | null;
  first: string | null;
  prev: string | null;
  next: string | null;
  last: string | null;
}

export interface ApiResponseMetadata {
  timestamp?: string;
  correlation_id?: string;
  request_id?: string;
  api_version?: string;
  method?: string;
  url?: string;
  client_ip?: string | null;
  user_agent?: string | null;
  page?: number;
  size?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
  links?: PaginationLinks;
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
  total: number;
  page: number;
  size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
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

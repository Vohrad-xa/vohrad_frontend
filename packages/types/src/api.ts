export interface BaseCredentials {
  email: string;
  password: string;
}
export interface UserLoginRequest extends BaseCredentials {
  tenant_id?: string;
}

export type AdminLoginRequest = BaseCredentials;

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface ApiResponseMetadata {
  timestamp?: string;
  correlation_id?: string;
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
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  metadata?: ApiResponseMetadata;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

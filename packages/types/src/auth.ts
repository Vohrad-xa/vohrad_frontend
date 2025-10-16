import type {TokenResponse, UserLoginRequest, AdminLoginRequest} from './api';
export interface User {
  id: string;
  email: string;
  role: string;
  role_description?: string | null;
  tenant_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
export type UserCredentials = UserLoginRequest;
export type AdminCredentials = AdminLoginRequest;
export type UserUpdateData = Partial<
  Pick<
    User,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'phone_number'
    | 'date_of_birth'
    | 'address'
    | 'city'
    | 'province'
    | 'postal_code'
    | 'country'
  >
>;
export interface AuthTokens extends TokenResponse {
  issued_at?: number;
}
export interface AsyncState<TData = unknown, TError = string | null> {
  data: TData;
  isLoading: boolean;
  error: TError;
}
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
}
export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (
    email: string,
    password: string,
    subdomain: string,
  ) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

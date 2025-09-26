import type {TokenResponse, UserLoginRequest, AdminLoginRequest} from './api';
export interface User {
  id: string;
  email: string;
  role: string;
  tenant_id?: string;
}
export type UserCredentials = UserLoginRequest;
export type AdminCredentials = AdminLoginRequest;
export type AuthTokens = TokenResponse;
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
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  clearError: () => void;
}
export interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

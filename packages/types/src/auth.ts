import type {Tenant} from './tenant';
import type {User, AuthTokens} from './schemas';

export interface AsyncState<TData = unknown, TError = string | null> {
  data: TData;
  isLoading: boolean;
  error: TError;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  intendedRoute: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntendedRoute: (route: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  updateTenant: (tenantData: Partial<Tenant>) => void;
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

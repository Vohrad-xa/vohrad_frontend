export type TokenRefreshHandler = () => Promise<void>;

class AuthContext {
  private accessToken: string | null = null;
  private tenantId: string | null = null;
  private tokenRefreshHandler: TokenRefreshHandler | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setTenantId(id: string | null): void {
    this.tenantId = id;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  setTokenRefreshHandler(handler: TokenRefreshHandler | null): void {
    this.tokenRefreshHandler = handler;
  }

  getTokenRefreshHandler(): TokenRefreshHandler | null {
    return this.tokenRefreshHandler;
  }
}

export const authContext = new AuthContext();

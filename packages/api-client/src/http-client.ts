import type {ApiResponse} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {resolveApiUrl, getApiConfig} from './config';

export class HttpClient {
  private accessToken: string | null = null;
  private onTokenRefresh: (() => Promise<void>) | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setTokenRefreshHandler(handler: () => Promise<void>) {
    this.onTokenRefresh = handler;
  }

  async makeRequest<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<ApiResponse<T>> {
    const url = resolveApiUrl(endpoint);
    const apiConfig = getApiConfig();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    // DEVELOPMENT ONLY: Send tenant via header for IP-based development
    if (apiConfig.tenant) {
      headers['X-Tenant-Subdomain'] = apiConfig.tenant;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Intercept 401 responses and attempt token refresh
      if (response.status === 401 && !isRetry && this.onTokenRefresh) {
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh');

        if (!isAuthEndpoint) {
          try {
            await this.onTokenRefresh();

            // Retry original request with new token
            return this.makeRequest(endpoint, options, true);
          } catch (refreshError) {
            // Refresh failed, let original 401 error propagate
            // The refresh handler should already handle logout
          }
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || `HTTP ${response.status}`, response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(error instanceof Error ? error.message : 'Network error occurred', 0);
    }
  }

  // Convenience methods for common HTTP verbs
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'GET'});
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'DELETE'});
  }
}

// Create singleton instance with env-driven configuration
export const httpClient = new HttpClient();

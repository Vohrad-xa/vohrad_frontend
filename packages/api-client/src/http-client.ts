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

  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const url = resolveApiUrl(endpoint);
    const apiConfig = getApiConfig();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const isBrowser =
      typeof window !== 'undefined' && typeof document !== 'undefined';

    if (isBrowser && !headers['X-Client-Platform']) {
      // Tell the API when we are running from the web build so it can switch to cookie auth.
      headers['X-Client-Platform'] = 'web';
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    // DEVELOPMENT ONLY: Send tenant via header for IP-based development
    // NOTE: Now using subdomain in URL instead (tenant.domain.com)
    if (apiConfig.tenant) {
      headers['X-Tenant-Subdomain'] = apiConfig.tenant;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (isBrowser) {
      // Allow browser fetch to include HttpOnly refresh cookies.
      config.credentials = 'include';
    }

    try {
      const response = await this.fetchWithRetry(url, config);

      // Intercept 401 responses and attempt token refresh
      if (response.status === 401 && !isRetry && this.onTokenRefresh) {
        const isAuthEndpoint =
          endpoint.includes('/auth/login') ||
          endpoint.includes('/auth/refresh');

        if (!isAuthEndpoint) {
          try {
            await this.onTokenRefresh();

            // Retry original request with new token
            return this.makeRequest(endpoint, options, true);
          } catch (_refreshError) {
            // Refresh failed, let original 401 error propagate
            // The refresh handler should already handle logout
          }
        }
      }

      const data = await response.json();

      if (!response.ok) {
        let errorMessage =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          `HTTP ${response.status}`;

        if (Array.isArray(data?.detail) && data.detail.length > 0) {
          const firstDetail = data.detail[0];
          let message = firstDetail.msg || firstDetail.message || errorMessage;
          message = message.replace(/^Value error,\s*/i, '');

          if (Array.isArray(firstDetail.loc) && firstDetail.loc.length > 0) {
            const field = firstDetail.loc[firstDetail.loc.length - 1];
            if (typeof field === 'string' && field.length > 0) {
              const lowerField = field.toLowerCase();
              if (!message.toLowerCase().includes(lowerField)) {
                message = `${field}: ${message}`;
              }
            }
          }

          errorMessage = message;
        } else if (data?.error?.details?.validation_errors?.length > 0) {
          const firstError = data.error.details.validation_errors[0];
          let message = firstError.message || errorMessage;
          message = message.replace(/^Value error,\s*/i, '');
          errorMessage = message;
        } else if (data?.error?.details?.reason) {
          errorMessage = data.error.details.reason;
        }

        throw new ApiError(errorMessage, response.status);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
      );
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

  // Exponential-backoff retry for transient fetch failures (network layer only).
  private async fetchWithRetry(
    url: string,
    config: RequestInit,
    maxRetries = 3,
  ): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        return await fetch(url, config);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        const isLastAttempt = attempt === maxRetries - 1;
        if (!isLastAttempt) {
          const delayMs = 1000 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Network request failed');
  }
}

// Create singleton instance with env-driven configuration
export const httpClient = new HttpClient();

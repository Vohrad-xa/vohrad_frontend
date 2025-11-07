import type {ApiResponse} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {resolveApiUrl, getApiConfig} from './config';
import {loadingManager} from './loading-manager';

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
    const loadingToken = loadingManager.startRequest();
    const url = resolveApiUrl(endpoint);
    const apiConfig = getApiConfig();

    const incomingHeaders = (options.headers as Record<string, string>) || {};
    const isFormDataBody =
      typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...incomingHeaders,
    };

    if (!isFormDataBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

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

      const rawBody = await response.text();
      const hasBody = !!rawBody && rawBody.trim().length > 0;

      let parsedBody: unknown = null;
      if (hasBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch (parseError) {
          if (response.ok) {
            // Successful response with non-JSON payload
            return {
              success: true,
              data: undefined as T,
              message: '',
              metadata: undefined,
            };
          }

          throw new ApiError(
            parseError instanceof Error
              ? parseError.message
              : 'Unable to parse server response',
            response.status,
          );
        }
      }

      if (!response.ok) {
        const errorPayload = parsedBody as
          | {
              error?: string;
              message?: string;
              detail?: Array<{
                loc?: unknown[];
                msg?: string;
                message?: string;
              }>;
            }
          | undefined;

        let errorMessage =
          errorPayload?.error ||
          errorPayload?.message ||
          `HTTP ${response.status}`;

        if (
          Array.isArray(errorPayload?.detail) &&
          errorPayload.detail.length > 0
        ) {
          const firstDetail = errorPayload.detail[0];
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
        }
        throw new ApiError(errorMessage, response.status);
      }

      if (parsedBody && typeof parsedBody === 'object') {
        return parsedBody as ApiResponse<T>;
      }

      // Successful response with no body (e.g., 204 No Content)
      return {
        success: true,
        data: undefined as T,
        message: '',
        metadata: undefined,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unable to connect',
        0,
      );
    } finally {
      loadingManager.finishRequest(loadingToken);
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

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
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

  // Single fetch attempt with timeout to prevent infinite hanging
  private async fetchWithRetry(
    url: string,
    config: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutMs = 15000; // 15 second timeout

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Distinguish timeout from other network errors
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.name === 'TimeoutError')
      ) {
        throw new Error('Connection timeout, please try again');
      }

      throw error instanceof Error ? error : new Error('Unable to connect');
    }
  }
}

// Create singleton instance with env-driven configuration
export const httpClient = new HttpClient();

import type {ApiResponse} from '@sykamore/types';
import {ApiError} from '@sykamore/types';
import {resolveApiUrl, getApiConfig} from './config';
import {loadingManager} from './loading-manager';
import {errorManager} from './error-manager';

export class HttpClient {
  private accessToken: string | null = null;
  private onTokenRefresh: (() => Promise<void>) | null = null;
  private retryCallbacks = new Map<string, () => Promise<void>>();

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setTokenRefreshHandler(handler: () => Promise<void>) {
    this.onTokenRefresh = handler;
  }

  async makeRequest<T>(
    urlOrEndpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const loadingToken = loadingManager.startRequest();

    // Detect if it's a full URL or relative endpoint
    const isFullUrl =
      urlOrEndpoint.startsWith('http://') ||
      urlOrEndpoint.startsWith('https://');
    const url = isFullUrl ? urlOrEndpoint : resolveApiUrl(urlOrEndpoint);
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
          urlOrEndpoint.includes('/auth/login') ||
          urlOrEndpoint.includes('/auth/refresh');

        if (!isAuthEndpoint) {
          try {
            await this.onTokenRefresh();

            // Retry original request with new token
            return this.makeRequest(urlOrEndpoint, options, true);
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
              error?:
                | string
                | {
                    message?: string;
                    code?: string;
                    type?: string;
                  };
              message?: string;
              detail?: Array<{
                loc?: unknown[];
                msg?: string;
                message?: string;
              }>;
            }
          | undefined;

        let errorMessage = `HTTP ${response.status}`;

        // Handle nested error object structure (e.g., { error: { message: "..." } })
        if (errorPayload?.error) {
          if (typeof errorPayload.error === 'string') {
            errorMessage = errorPayload.error;
          } else if (typeof errorPayload.error === 'object') {
            errorMessage =
              errorPayload.error.message ||
              errorPayload.error.code ||
              `HTTP ${response.status}`;
          }
        } else if (errorPayload?.message) {
          errorMessage = errorPayload.message;
        }

        // Handle backend validation errors format
        const errorObj = errorPayload?.error;
        if (
          errorObj &&
          typeof errorObj === 'object' &&
          'details' in errorObj &&
          errorObj.details &&
          typeof errorObj.details === 'object' &&
          'validation_errors' in errorObj.details &&
          Array.isArray(errorObj.details.validation_errors) &&
          errorObj.details.validation_errors.length > 0
        ) {
          const validationError = errorObj.details.validation_errors[0] as {
            message?: string;
            field?: string;
          };
          errorMessage = validationError.message || errorMessage;
          errorMessage = errorMessage.replace(/^Value error,\s*/i, '');
        }

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

        const apiError = new ApiError(errorMessage, response.status);
        errorManager.reportError(apiError.message, apiError.status);
        throw apiError;
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

      const networkError = new ApiError(
        error instanceof Error ? error.message : 'Unable to connect',
        0,
      );

      // Store retry callback for this request
      const requestId = `retry-${Date.now()}-${Math.random()}`;
      this.retryCallbacks.set(requestId, async () => {
        await this.makeRequest<T>(urlOrEndpoint, options, false);
      });

      errorManager.reportError(
        networkError.message,
        networkError.status,
        async () => {
          const retryCallback = this.retryCallbacks.get(requestId);
          if (retryCallback) {
            await retryCallback();
            this.retryCallbacks.delete(requestId);
          }
        },
      );
      throw networkError;
    } finally {
      loadingManager.finishRequest(loadingToken);
    }
  }

  // Convenience methods for common HTTP verbs
  async get<T>(urlOrEndpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(urlOrEndpoint, {method: 'GET'});
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
    // If external signal provided, use it; otherwise create internal timeout controller
    const externalSignal = config.signal;
    const controller = new AbortController();
    const timeoutMs = 10000;

    // Combine external signal with timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // If external signal aborts, abort internal controller too
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if external abort (component unmount)
      if (externalSignal?.aborted) {
        throw new Error('Request cancelled');
      }

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

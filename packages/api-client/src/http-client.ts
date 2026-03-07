import type {ApiResponse} from '@sykamore/types';
import {ApiError, parseJson} from '@sykamore/types';
import {resolveApiUrl} from './config';
import {loadingManager} from './loading-manager';
import {errorManager} from './error-manager';

/**
 * Thin fetch wrapper that injects auth headers, retries on 401, and enforces request timeouts.
 */
export class HttpClient {
  private accessToken: string | null = null;
  private tenantId: string | null = null;
  private onTokenRefresh: (() => Promise<void>) | null = null;
  private retryCallbacks = new Map<string, () => Promise<void>>();
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setTenantId(id: string | null) {
    this.tenantId = id;
  }

  /**
   * Registers the handler invoked when a 401 response is received.
   *
   * - The handler must refresh the token and update the client; it should handle logout on failure.
   */
  setTokenRefreshHandler(handler: () => Promise<void>) {
    this.onTokenRefresh = handler;
  }

  /**
   * Executes an HTTP request, injecting auth headers and retrying once on 401.
   *
   * - Accepts a full URL or a relative endpoint resolved via resolveApiUrl().
   * - On 401, triggers the token refresh handler and retries the original request once.
   */
  async makeRequest<T>(
    urlOrEndpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const loadingToken = loadingManager.startRequest();
    const isAuthTokenGrantEndpoint =
      this.isAuthTokenGrantEndpoint(urlOrEndpoint);

    const isFullUrl =
      urlOrEndpoint.startsWith('http://') ||
      urlOrEndpoint.startsWith('https://');
    const url = isFullUrl ? urlOrEndpoint : resolveApiUrl(urlOrEndpoint);

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
      // Signals the API to switch to cookie-based auth for web sessions.
      headers['X-Client-Platform'] = 'web';
    }

    if (this.accessToken && !isAuthTokenGrantEndpoint) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    if (this.tenantId && !isAuthTokenGrantEndpoint) {
      headers['X-Tenant-Id'] = this.tenantId;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (isBrowser) {
      // Required for the browser to send HttpOnly refresh cookies.
      config.credentials = 'include';
    }

    try {
      const response = await this.fetchWithRetry(url, config);

      if (
        response.status === 401 &&
        !isRetry &&
        this.onTokenRefresh &&
        !isAuthTokenGrantEndpoint
      ) {
        try {
          await this.onTokenRefresh();
          return this.makeRequest(urlOrEndpoint, options, true);
        } catch (_refreshError) {
          // Refresh failed — let the original 401 propagate; the handler owns logout.
        }
      }

      const rawBody = (await response.text()).trim();

      let parsedBody: unknown = null;
      if (rawBody.length > 0) {
        const parsedResult = parseJson(rawBody);
        if (parsedResult.success) {
          parsedBody = parsedResult.data;
        } else if (response.ok) {
          // Successful response with a non-JSON body.
          return {
            success: true,
            data: undefined as T,
            message: '',
            metadata: undefined,
          };
        } else {
          throw new ApiError(
            'Unable to parse server response',
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

        // Handle nested error object: { error: { message, code } }
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

        // Handle backend validation errors: { error: { details: { validation_errors } } }
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

      // 204 No Content or empty body.
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

  async get<T>(urlOrEndpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(urlOrEndpoint, {method: 'GET'});
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      headers,
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

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'DELETE'});
  }

  private isAuthTokenGrantEndpoint(urlOrEndpoint: string): boolean {
    return (
      urlOrEndpoint.includes('/auth/oidc/') ||
      urlOrEndpoint.includes('/auth/web/token') ||
      urlOrEndpoint.includes('/auth/social/exchange') ||
      urlOrEndpoint.includes('/auth/social/refresh')
    );
  }

  private async fetchWithRetry(
    url: string,
    config: RequestInit,
  ): Promise<Response> {
    const externalSignal = config.signal;
    const controller = new AbortController();
    const timeoutMs = 10000;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    if (externalSignal) {
      // Propagate external cancellation (e.g. component unmount) into the internal controller.
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

      if (externalSignal?.aborted) {
        throw new Error('Request cancelled');
      }

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

export const httpClient = new HttpClient();

import type {AnySchema, ApiResponse, SchemaOutput} from '@sykamore/types';
import {authContext, type TokenRefreshHandler} from './auth-context';
import {apiClientEvents} from './events';
import {isExternalAbort, normalizeTransportError} from './network-error';
import {parseProblemResponse} from './problem-parser';
import {
  createRequestId,
  executeRequest,
  isAuthTokenGrantEndpoint,
  serializeJsonBody,
  type RequestOptions,
} from './request';
import {parseSuccessResponse} from './response-parser';

export class HttpClient {
  setAccessToken(token: string | null): void {
    authContext.setAccessToken(token);
  }

  setTenantId(id: string | null): void {
    authContext.setTenantId(id);
  }

  setTokenRefreshHandler(handler: TokenRefreshHandler | null): void {
    authContext.setTokenRefreshHandler(handler);
  }

  async makeRequest<TSchema extends AnySchema>(
    urlOrEndpoint: string,
    dataSchema: TSchema,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    const requestId = createRequestId();
    const reportErrors = options.reportErrors !== false;
    const retryCallback = async () => {
      await this.makeRequest(urlOrEndpoint, dataSchema, options, false);
    };

    apiClientEvents.emitRequestActivity({requestId, phase: 'started'});

    try {
      const response = await executeRequest(urlOrEndpoint, options);
      const refreshHandler = authContext.getTokenRefreshHandler();
      const isTokenGrantEndpoint = isAuthTokenGrantEndpoint(urlOrEndpoint);

      if (
        response.status === 401 &&
        !isRetry &&
        refreshHandler &&
        !isTokenGrantEndpoint
      ) {
        try {
          await refreshHandler();
          return this.makeRequest(urlOrEndpoint, dataSchema, options, true);
        } catch {
          // Refresh handler owns logout and retry policy.
        }
      }

      const rawBody = (await response.text()).trim();
      if (!response.ok) {
        const apiError = parseProblemResponse(response, rawBody);
        if (reportErrors) {
          apiClientEvents.emitError({error: apiError, retry: retryCallback});
        }
        throw apiError;
      }

      return parseSuccessResponse(response.status, rawBody, dataSchema);
    } catch (error) {
      if (isExternalAbort(options.signal, error)) {
        throw error;
      }

      const apiError = normalizeTransportError(error);
      if (reportErrors) {
        apiClientEvents.emitError({error: apiError, retry: retryCallback});
      }
      throw apiError;
    } finally {
      apiClientEvents.emitRequestActivity({requestId, phase: 'finished'});
    }
  }

  async get<TSchema extends AnySchema>(
    urlOrEndpoint: string,
    dataSchema: TSchema,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(urlOrEndpoint, dataSchema, {
      ...options,
      method: 'GET',
    });
  }

  async post<TSchema extends AnySchema>(
    endpoint: string,
    dataSchema: TSchema,
    body?: unknown,
    headers?: Record<string, string>,
    options?: Omit<RequestOptions, 'method' | 'body' | 'headers'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(endpoint, dataSchema, {
      ...options,
      method: 'POST',
      headers,
      body: serializeJsonBody(body),
    });
  }

  async postFormData<TSchema extends AnySchema>(
    endpoint: string,
    dataSchema: TSchema,
    formData: FormData,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(endpoint, dataSchema, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }

  async put<TSchema extends AnySchema>(
    endpoint: string,
    dataSchema: TSchema,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(endpoint, dataSchema, {
      ...options,
      method: 'PUT',
      body: serializeJsonBody(body),
    });
  }

  async patch<TSchema extends AnySchema>(
    endpoint: string,
    dataSchema: TSchema,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(endpoint, dataSchema, {
      ...options,
      method: 'PATCH',
      body: serializeJsonBody(body),
    });
  }

  async delete<TSchema extends AnySchema>(
    endpoint: string,
    dataSchema: TSchema,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<SchemaOutput<TSchema>>> {
    return this.makeRequest(endpoint, dataSchema, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const httpClient = new HttpClient();

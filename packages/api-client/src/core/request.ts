import {ApiError} from '@sykamore/types';
import {authContext} from './auth-context';
import {resolveApiUrl} from './url-resolver';

export type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  headers?: Record<string, string>;
  body?: BodyInit | FormData | string | null;
  reportErrors?: boolean;
};

const REQUEST_TIMEOUT_MS = 10000;

export function createRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function serializeJsonBody(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

export function isAuthTokenGrantEndpoint(urlOrEndpoint: string): boolean {
  return (
    urlOrEndpoint.includes('/auth/oidc/') ||
    urlOrEndpoint.includes('/auth/web/token') ||
    urlOrEndpoint.includes('/auth/apple/exchange') ||
    urlOrEndpoint.includes('/auth/apple/refresh')
  );
}

export async function executeRequest(
  urlOrEndpoint: string,
  options: RequestOptions,
): Promise<Response> {
  const {
    headers: incomingHeaders = {},
    reportErrors: _reportErrors,
    body,
    ...rest
  } = options;
  const isFormDataBody =
    typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = {...incomingHeaders};

  if (
    !isFormDataBody &&
    body !== undefined &&
    body !== null &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const isBrowser =
    typeof globalThis.window !== 'undefined' &&
    typeof globalThis.document !== 'undefined';
  const isTokenGrantEndpoint = isAuthTokenGrantEndpoint(urlOrEndpoint);

  if (isBrowser && !headers['X-Client-Platform']) {
    headers['X-Client-Platform'] = 'web';
  }

  const accessToken = authContext.getAccessToken();
  if (accessToken && !isTokenGrantEndpoint) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const tenantId = authContext.getTenantId();
  if (tenantId && !isTokenGrantEndpoint) {
    headers['X-Tenant-Id'] = tenantId;
  }

  const requestInit: RequestInit = {
    ...rest,
    body,
    headers,
  };

  if (isBrowser) {
    requestInit.credentials = 'include';
  }

  const url =
    urlOrEndpoint.startsWith('http://') || urlOrEndpoint.startsWith('https://')
      ? urlOrEndpoint
      : resolveApiUrl(urlOrEndpoint);

  return fetchWithTimeout(url, requestInit, REQUEST_TIMEOUT_MS);
}

async function fetchWithTimeout(
  url: string,
  config: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const externalSignal = config.signal;
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const onAbort = () => controller.abort();
    externalSignal.addEventListener('abort', onAbort, {once: true});

    try {
      return await fetch(url, {
        ...config,
        signal: controller.signal,
      });
    } catch (error) {
      if (didTimeout) {
        throw ApiError.timeout(undefined, error);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      externalSignal.removeEventListener('abort', onAbort);
    }
  }

  try {
    return await fetch(url, {
      ...config,
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout) {
      throw ApiError.timeout(undefined, error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

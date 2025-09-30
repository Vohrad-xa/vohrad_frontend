import type {ApiResponse} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {resolveApiUrl, getApiConfig} from './config';

export class HttpClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async makeRequest<T>(endpoint: string, options: RequestInit = {}, tenant?: string): Promise<ApiResponse<T>> {
    const url = resolveApiUrl(endpoint);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    // Development fallback: add header for IP addresses
    const tenantId = tenant || getApiConfig().tenant;

    // Only use header fallback in development environments
    if (process.env.NODE_ENV === 'development' || process.env.EXPO_PUBLIC_API_PROTOCOL === 'http') {
      const url_obj = new URL(url);
      const isIpAddress = /^[\d\.:]+$/.test(url_obj.hostname);

      if (tenantId && isIpAddress) {
        // IP address: use header as fallback for development only
        headers['X-Tenant-Subdomain'] = tenantId;
      }
    }
    // Production: tenant is handled via true subdomain in URL

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
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
  async get<T>(endpoint: string, tenant?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'GET'}, tenant);
  }

  async post<T>(endpoint: string, body?: unknown, tenant?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      tenant,
    );
  }

  async put<T>(endpoint: string, body?: unknown, tenant?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      tenant,
    );
  }

  async delete<T>(endpoint: string, tenant?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'DELETE'}, tenant);
  }
}

// Create singleton instance with env-driven configuration
export const httpClient = new HttpClient();

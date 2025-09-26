import type {ApiResponse} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {resolveApiUrl} from './config';

export class HttpClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async makeRequest<T>(endpoint: string, options: RequestInit = {}, subdomain?: string): Promise<ApiResponse<T>> {
    const url = resolveApiUrl(endpoint, subdomain);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

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
  async get<T>(endpoint: string, subdomain?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'GET'}, subdomain);
  }

  async post<T>(endpoint: string, body?: unknown, subdomain?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      subdomain,
    );
  }

  async put<T>(endpoint: string, body?: unknown, subdomain?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      subdomain,
    );
  }

  async delete<T>(endpoint: string, subdomain?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {method: 'DELETE'}, subdomain);
  }
}

// Create singleton instance with env-driven configuration
export const httpClient = new HttpClient();

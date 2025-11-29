import type {
  ApiResponse,
  PaginatedResponse,
  Role,
  RoleCreate,
  RoleUpdate,
} from '@vohrad/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export class RoleApi {
  async getRoles(
    urlOrPage: string | number,
    size = 20,
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    if (typeof urlOrPage === 'string') {
      return httpClient.get<PaginatedResponse<Role>>(urlOrPage);
    }

    const page = urlOrPage;
    return httpClient.get<PaginatedResponse<Role>>(
      `${API_ENDPOINTS.ROLES.LIST}?page=${page}&size=${size}`,
    );
  }

  async searchRoles(
    query: string,
    page = 1,
    size = 20,
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      size: String(size),
    });

    return httpClient.get<PaginatedResponse<Role>>(
      `${API_ENDPOINTS.ROLES.SEARCH}?${params.toString()}`,
    );
  }

  async getActiveRoles(): Promise<Role[]> {
    const response = await httpClient.get<Role[]>(API_ENDPOINTS.ROLES.ACTIVE);
    return response.data;
  }

  async getRoleById(id: string): Promise<Role> {
    const response = await httpClient.get<Role>(API_ENDPOINTS.ROLES.DETAIL(id));
    return response.data;
  }

  async createRole(data: RoleCreate): Promise<Role> {
    const response = await httpClient.post<Role>(
      API_ENDPOINTS.ROLES.CREATE,
      data,
    );
    return response.data;
  }

  async updateRole(id: string, data: RoleUpdate): Promise<Role> {
    const response = await httpClient.put<Role>(
      API_ENDPOINTS.ROLES.UPDATE(id),
      data,
    );
    return response.data;
  }

  async activateRole(id: string): Promise<Role> {
    const response = await httpClient.put<Role>(
      API_ENDPOINTS.ROLES.ACTIVATE(id),
    );
    return response.data;
  }

  async deactivateRole(id: string): Promise<Role> {
    const response = await httpClient.put<Role>(
      API_ENDPOINTS.ROLES.DEACTIVATE(id),
    );
    return response.data;
  }

  async deleteRole(id: string, etag: string): Promise<void> {
    const normalizedEtag = etag?.trim();
    if (!normalizedEtag) {
      throw new Error('ETag is required to delete a role.');
    }

    await httpClient.makeRequest<void>(API_ENDPOINTS.ROLES.DELETE(id), {
      method: 'DELETE',
      headers: {
        'If-Match': normalizedEtag,
      },
    });
  }
}

export const roleApi = new RoleApi();

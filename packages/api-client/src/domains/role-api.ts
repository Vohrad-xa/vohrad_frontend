import type {
  ApiResponse,
  PaginatedResponse,
  Role,
  RoleCreate,
  RoleUpdate,
  CursorDirection,
  CursorOrder,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export type ListRolesParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
};

export class RoleApi {
  async getRoles(
    params: ListRolesParams = {},
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const search = new URLSearchParams();
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursor) {
      search.set('cursor', params.cursor);
    }
    if (params.direction) {
      search.set('direction', params.direction);
    }
    if (params.order) {
      search.set('order', params.order);
    }

    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ROLES.LIST}?${queryString}`
      : API_ENDPOINTS.ROLES.LIST;
    return httpClient.get<PaginatedResponse<Role>>(endpoint);
  }

  async searchRoles(
    query: string,
    params: ListRolesParams = {},
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const search = new URLSearchParams({q: query});
    if (typeof params.limit === 'number') {
      search.set('limit', String(params.limit));
    }
    if (params.cursor) {
      search.set('cursor', params.cursor);
    }
    if (params.direction) {
      search.set('direction', params.direction);
    }
    if (params.order) {
      search.set('order', params.order);
    }

    return httpClient.get<PaginatedResponse<Role>>(
      `${API_ENDPOINTS.ROLES.SEARCH}?${search.toString()}`,
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
    const response = await httpClient.patch<Role>(
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

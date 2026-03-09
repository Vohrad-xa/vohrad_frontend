import {
  createPaginatedResponseSchema,
  emptyDataSchema,
  roleSchema,
  type ApiResponse,
  type CursorDirection,
  type CursorOrder,
  type PaginatedResponse,
  type Role,
  type RoleCreate,
  type RoleUpdate,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';

const paginatedRolesSchema = createPaginatedResponseSchema(roleSchema);
const activeRolesSchema = roleSchema.array();

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
    return httpClient.get(endpoint, paginatedRolesSchema);
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

    return httpClient.get(
      `${API_ENDPOINTS.ROLES.SEARCH}?${search.toString()}`,
      paginatedRolesSchema,
    );
  }

  async getActiveRoles(): Promise<Role[]> {
    const response = await httpClient.get(
      API_ENDPOINTS.ROLES.ACTIVE,
      activeRolesSchema,
    );
    return response.data;
  }

  async getRoleById(id: string): Promise<Role> {
    const response = await httpClient.get(
      API_ENDPOINTS.ROLES.DETAIL(id),
      roleSchema,
    );
    return response.data;
  }

  async createRole(data: RoleCreate): Promise<Role> {
    const response = await httpClient.post(
      API_ENDPOINTS.ROLES.CREATE,
      roleSchema,
      data,
    );
    return response.data;
  }

  async updateRole(id: string, data: RoleUpdate): Promise<Role> {
    const response = await httpClient.patch(
      API_ENDPOINTS.ROLES.UPDATE(id),
      roleSchema,
      data,
    );
    return response.data;
  }

  async activateRole(id: string): Promise<Role> {
    const response = await httpClient.put(
      API_ENDPOINTS.ROLES.ACTIVATE(id),
      roleSchema,
    );
    return response.data;
  }

  async deactivateRole(id: string): Promise<Role> {
    const response = await httpClient.put(
      API_ENDPOINTS.ROLES.DEACTIVATE(id),
      roleSchema,
    );
    return response.data;
  }

  async deleteRole(id: string, etag: string): Promise<void> {
    const normalizedEtag = etag?.trim();
    if (!normalizedEtag) {
      throw new Error('ETag is required to delete a role.');
    }

    await httpClient.delete(API_ENDPOINTS.ROLES.DELETE(id), emptyDataSchema, {
      headers: {
        'If-Match': normalizedEtag,
      },
    });
  }
}

export const roleApi = new RoleApi();

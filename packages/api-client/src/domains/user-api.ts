import type {
  User,
  UserCreateData,
  UserUpdateData,
  ApiResponse,
  PaginatedResponse,
  CursorDirection,
  CursorOrder,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export type ListUsersParams = {
  limit?: number;
  cursor?: string;
  direction?: CursorDirection;
  order?: CursorOrder;
  odataFilter?: string;
  odataOrderBy?: string;
  count?: boolean;
};

export class UserApi {
  async getUsers(
    params: ListUsersParams = {},
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
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
    if (params.odataFilter) {
      search.set('odata_filter', params.odataFilter);
    }
    if (params.odataOrderBy) {
      search.set('odata_orderby', params.odataOrderBy);
    }
    if (typeof params.count === 'boolean') {
      search.set('odata_count', String(params.count));
    }
    const queryString = search.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.USERS.LIST}?${queryString}`
      : API_ENDPOINTS.USERS.LIST;
    return httpClient.get<PaginatedResponse<User>>(endpoint);
  }

  async createUser(data: UserCreateData): Promise<User> {
    const response = await httpClient.post<User>(
      API_ENDPOINTS.USERS.CREATE,
      data,
    );
    return response.data;
  }

  async getUserProfile(): Promise<User> {
    const response = await httpClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  }

  async updateUserProfile(data: UserUpdateData): Promise<User> {
    const response = await httpClient.patch<User>(
      API_ENDPOINTS.USERS.PROFILE,
      data,
    );
    return response.data;
  }

  async resendPendingEmail(): Promise<User> {
    const response = await httpClient.post<User>(
      API_ENDPOINTS.EMAIL_VERIFICATION.RESEND,
      {},
    );
    return response.data;
  }

  async confirmPendingEmail(
    token: string,
    tenantId?: string | null,
  ): Promise<User> {
    const normalizedTenantId = tenantId?.trim();
    const hasTenantId = Boolean(normalizedTenantId);

    const endpoint = hasTenantId
      ? API_ENDPOINTS.EMAIL_VERIFICATION.CONFIRM_PUBLIC
      : API_ENDPOINTS.EMAIL_VERIFICATION.CONFIRM;

    const payload = hasTenantId
      ? {token, tenant_id: normalizedTenantId}
      : {token};

    const response = await httpClient.post<User>(endpoint, payload);
    return response.data;
  }
}

export const userApi = new UserApi();

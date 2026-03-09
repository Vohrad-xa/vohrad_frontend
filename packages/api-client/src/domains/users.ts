import {
  createPaginatedResponseSchema,
  userSchema,
  type ApiResponse,
  type CursorDirection,
  type CursorOrder,
  type PaginatedResponse,
  type User,
  type UserCreateData,
  type UserUpdateData,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';

const paginatedUsersSchema = createPaginatedResponseSchema(userSchema);

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
    return httpClient.get(endpoint, paginatedUsersSchema);
  }

  async createUser(data: UserCreateData): Promise<User> {
    const response = await httpClient.post(
      API_ENDPOINTS.USERS.CREATE,
      userSchema,
      data,
    );
    return response.data;
  }

  async getUserProfile(): Promise<User> {
    const response = await httpClient.get(
      API_ENDPOINTS.USERS.PROFILE,
      userSchema,
    );
    return response.data;
  }

  async updateUserProfile(data: UserUpdateData): Promise<User> {
    const response = await httpClient.patch(
      API_ENDPOINTS.USERS.PROFILE,
      userSchema,
      data,
    );
    return response.data;
  }
}

export const userApi = new UserApi();

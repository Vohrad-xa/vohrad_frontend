import type {
  User,
  UserCreateData,
  UserUpdateData,
  ApiResponse,
  PaginatedResponse,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export class UserApi {
  async getUsers(
    page: number,
    size: number,
    odataFilter?: string,
    odataOrderBy?: string,
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const search = new URLSearchParams();
    search.set('page', String(page));
    search.set('size', String(size));
    if (odataFilter) {
      search.set('$filter', odataFilter);
    }
    if (odataOrderBy) {
      search.set('$orderby', odataOrderBy);
    }
    const queryString = search.toString();
    return httpClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS.LIST}?${queryString}`,
    );
  }

  async createUser(data: UserCreateData): Promise<User> {
    const response = await httpClient.post<User>(
      API_ENDPOINTS.USERS.CREATE,
      data,
    );
    return response.data;
  }

  async getUserProfile(): Promise<User> {
    const response = await httpClient.get<User>(API_ENDPOINTS.USERS.ME);
    return response.data;
  }

  async updateUserProfile(data: UserUpdateData): Promise<User> {
    const response = await httpClient.put<User>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
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

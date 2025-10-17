import type {User, UserUpdateData} from '@vohrad/types';
import {httpClient} from './http-client';
import {API_ENDPOINTS} from './endpoints';

export class UserApi {
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
      API_ENDPOINTS.USERS.RESEND_PENDING_EMAIL,
      {},
    );
    return response.data;
  }

  async confirmPendingEmail(token: string, tenantId?: string | null): Promise<User> {
    const normalizedTenantId = tenantId?.trim();
    const hasTenantId = Boolean(normalizedTenantId);

    const endpoint = hasTenantId
      ? API_ENDPOINTS.USERS.CONFIRM_PENDING_EMAIL_PUBLIC
      : API_ENDPOINTS.USERS.CONFIRM_PENDING_EMAIL;

    const payload = hasTenantId
      ? {token, tenant_id: normalizedTenantId}
      : {token};

    const response = await httpClient.post<User>(endpoint, payload);
    return response.data;
  }
}

export const userApi = new UserApi();

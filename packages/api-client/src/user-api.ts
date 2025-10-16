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
}

export const userApi = new UserApi();

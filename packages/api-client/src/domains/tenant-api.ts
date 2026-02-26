import type {
  Tenant,
  TenantSettingsUpdate,
  TenantProfileUpdate,
  TenantLicenseInfo,
} from '@sykamore/types';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export class TenantApi {
  async getTenantInfo(): Promise<Tenant> {
    const response = await httpClient.get<Tenant>(API_ENDPOINTS.TENANT.INFO);
    return response.data;
  }

  async updateTenantSettings(data: TenantSettingsUpdate): Promise<Tenant> {
    const response = await httpClient.patch<Tenant>(
      API_ENDPOINTS.TENANT.SETTINGS,
      data,
    );
    return response.data;
  }

  async updateTenantProfile(data: TenantProfileUpdate): Promise<Tenant> {
    const response = await httpClient.patch<Tenant>(
      API_ENDPOINTS.TENANT.PROFILE,
      data,
    );
    return response.data;
  }

  async getTenantLicenseInfo(): Promise<TenantLicenseInfo> {
    const response = await httpClient.get<TenantLicenseInfo>(
      API_ENDPOINTS.TENANT.LICENSE_INFO,
    );
    return response.data;
  }
}

export const tenantApi = new TenantApi();

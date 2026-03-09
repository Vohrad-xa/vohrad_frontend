import {
  tenantLicenseInfoSchema,
  tenantSchema,
  type Tenant,
  type TenantLicenseInfo,
  type TenantProfileUpdate,
  type TenantSettingsUpdate,
} from '@sykamore/types';
import {httpClient} from '../core/client';
import {API_ENDPOINTS} from './endpoints';

export class TenantApi {
  async getTenantInfo(): Promise<Tenant> {
    const response = await httpClient.get(
      API_ENDPOINTS.TENANT.INFO,
      tenantSchema,
    );
    return response.data;
  }

  async updateTenantSettings(data: TenantSettingsUpdate): Promise<Tenant> {
    const response = await httpClient.patch(
      API_ENDPOINTS.TENANT.SETTINGS,
      tenantSchema,
      data,
    );
    return response.data;
  }

  async updateTenantProfile(data: TenantProfileUpdate): Promise<Tenant> {
    const response = await httpClient.patch(
      API_ENDPOINTS.TENANT.PROFILE,
      tenantSchema,
      data,
    );
    return response.data;
  }

  async getTenantLicenseInfo(): Promise<TenantLicenseInfo> {
    const response = await httpClient.get(
      API_ENDPOINTS.TENANT.LICENSE_INFO,
      tenantLicenseInfoSchema,
    );
    return response.data;
  }
}

export const tenantApi = new TenantApi();

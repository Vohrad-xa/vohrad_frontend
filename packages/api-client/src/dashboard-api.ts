import type {ApiResponse} from '@vohrad/types';
import {API_ENDPOINTS} from './endpoints';
import {httpClient} from './http-client';

export interface DashboardOverview {
  items_total: number;
  locations_total: number;
  maintenance_total: number;
  suppliers_total: number;
  check_in_out_total: number;
  documents_total: number;
}

export class DashboardApi {
  async getOverview(): Promise<ApiResponse<DashboardOverview>> {
    return httpClient.get<DashboardOverview>(
      API_ENDPOINTS.SYSTEM.DASHBOARD_OVERVIEW,
    );
  }
}

export const dashboardApi = new DashboardApi();

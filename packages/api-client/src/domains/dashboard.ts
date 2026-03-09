import {
  dashboardOverviewSchema,
  type ApiResponse,
  type DashboardOverview,
} from '@sykamore/types';
import {API_ENDPOINTS} from './endpoints';
import {httpClient} from '../core/client';

export type {DashboardOverview};

export class DashboardApi {
  async getOverview(): Promise<ApiResponse<DashboardOverview>> {
    return httpClient.get(
      API_ENDPOINTS.SYSTEM.DASHBOARD_OVERVIEW,
      dashboardOverviewSchema,
    );
  }
}

export const dashboardApi = new DashboardApi();

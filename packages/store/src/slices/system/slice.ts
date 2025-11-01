import type {StateCreator} from 'zustand';
import type {DashboardOverview} from '@vohrad/api-client';

export type DashboardOverviewStatus = 'idle' | 'loading' | 'success' | 'error';

export type DashboardCardKey =
  | 'items'
  | 'locations'
  | 'maintenance'
  | 'suppliers'
  | 'checkInOut'
  | 'documents';

export type DashboardVisibilityState = Record<DashboardCardKey, boolean>;

const BASE_DASHBOARD_VISIBILITY: DashboardVisibilityState = {
  items: true,
  locations: true,
  maintenance: true,
  suppliers: true,
  checkInOut: true,
  documents: true,
};

export interface SystemSlice {
  dashboardOverview: DashboardOverview | null;
  dashboardOverviewStatus: DashboardOverviewStatus;
  dashboardOverviewError: string | null;
  setDashboardOverview: (overview: DashboardOverview | null) => void;
  setDashboardOverviewStatus: (status: DashboardOverviewStatus) => void;
  setDashboardOverviewError: (error: string | null) => void;
  dashboardVisibility: DashboardVisibilityState;
  setDashboardVisibility: (key: DashboardCardKey, value: boolean) => void;
  resetDashboardVisibility: () => void;
}

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  dashboardOverview: null,
  dashboardOverviewStatus: 'idle',
  dashboardOverviewError: null,
  setDashboardOverview: (overview) => set({dashboardOverview: overview}),
  setDashboardOverviewStatus: (status) =>
    set({dashboardOverviewStatus: status}),
  setDashboardOverviewError: (error) => set({dashboardOverviewError: error}),

  dashboardVisibility: {...BASE_DASHBOARD_VISIBILITY},
  setDashboardVisibility: (key, value) =>
    set((state) => ({
      dashboardVisibility: {
        ...state.dashboardVisibility,
        [key]: value,
      },
    })),
  resetDashboardVisibility: () =>
    set({dashboardVisibility: {...BASE_DASHBOARD_VISIBILITY}}),
});

export const defaultDashboardVisibility: DashboardVisibilityState = {
  ...BASE_DASHBOARD_VISIBILITY,
};

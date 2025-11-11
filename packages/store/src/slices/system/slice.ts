import type {StateCreator} from 'zustand';

export type DashboardCardKey =
  | 'items'
  | 'locations'
  | 'maintenance'
  | 'suppliers'
  | 'checkInOut'
  | 'attachments';

export type DashboardVisibilityState = Record<DashboardCardKey, boolean>;

const BASE_DASHBOARD_VISIBILITY: DashboardVisibilityState = {
  items: true,
  locations: true,
  maintenance: true,
  suppliers: true,
  checkInOut: true,
  attachments: true,
};

export interface SystemSlice {
  dashboardVisibility: DashboardVisibilityState;
  setDashboardVisibility: (key: DashboardCardKey, value: boolean) => void;
  resetDashboardVisibility: () => void;
}

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  // Dashboard Visibility State
  dashboardVisibility: {...BASE_DASHBOARD_VISIBILITY},

  // Dashboard Visibility Actions
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

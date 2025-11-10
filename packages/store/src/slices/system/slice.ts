import type {StateCreator} from 'zustand';
import type {DashboardOverview} from '@vohrad/api-client';

export type DashboardOverviewStatus = 'idle' | 'loading' | 'success' | 'error';

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
  dashboardOverview: DashboardOverview | null;
  dashboardOverviewStatus: DashboardOverviewStatus;
  dashboardOverviewError: string | null;
  setDashboardOverview: (overview: DashboardOverview | null) => void;
  setDashboardOverviewStatus: (status: DashboardOverviewStatus) => void;
  setDashboardOverviewError: (error: string | null) => void;
  updateAttachmentCount: (kind: string, delta: number) => void;
  dashboardVisibility: DashboardVisibilityState;
  setDashboardVisibility: (key: DashboardCardKey, value: boolean) => void;
  resetDashboardVisibility: () => void;
}

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  // Dashboard Overview State
  dashboardOverview: null,
  dashboardOverviewStatus: 'idle',
  dashboardOverviewError: null,

  // Dashboard Overview Actions
  setDashboardOverview: (overview) => set({dashboardOverview: overview}),
  setDashboardOverviewStatus: (status) =>
    set({dashboardOverviewStatus: status}),
  setDashboardOverviewError: (error) => set({dashboardOverviewError: error}),
  updateAttachmentCount: (kind, delta) =>
    set((state) => {
      if (!state.dashboardOverview?.attachment_counts) return state;

      const currentKindCount =
        state.dashboardOverview.attachment_counts[
          kind as keyof typeof state.dashboardOverview.attachment_counts
        ];
      const newKindCount =
        typeof currentKindCount === 'number'
          ? Math.max(0, currentKindCount + delta)
          : 0;
      const newTotal = Math.max(
        0,
        state.dashboardOverview.attachments_total + delta,
      );

      return {
        dashboardOverview: {
          ...state.dashboardOverview,
          attachments_total: newTotal,
          attachment_counts: {
            ...state.dashboardOverview.attachment_counts,
            [kind]: newKindCount,
          },
        },
      };
    }),

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

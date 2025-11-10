import type {SystemSlice} from './slice';

export const systemSelectors = {
  dashboardOverview: (state: SystemSlice) => state.dashboardOverview,
  dashboardOverviewStatus: (state: SystemSlice) =>
    state.dashboardOverviewStatus,
  dashboardOverviewError: (state: SystemSlice) => state.dashboardOverviewError,

  setDashboardOverview: (state: SystemSlice) => state.setDashboardOverview,
  setDashboardOverviewStatus: (state: SystemSlice) =>
    state.setDashboardOverviewStatus,
  setDashboardOverviewError: (state: SystemSlice) =>
    state.setDashboardOverviewError,
  updateAttachmentCount: (state: SystemSlice) => state.updateAttachmentCount,

  dashboardVisibility: (state: SystemSlice) => state.dashboardVisibility,

  setDashboardVisibility: (state: SystemSlice) => state.setDashboardVisibility,
  resetDashboardVisibility: (state: SystemSlice) =>
    state.resetDashboardVisibility,
};

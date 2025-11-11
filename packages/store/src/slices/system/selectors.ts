import type {SystemSlice} from './slice';

export const systemSelectors = {
  dashboardVisibility: (state: SystemSlice) => state.dashboardVisibility,
  setDashboardVisibility: (state: SystemSlice) => state.setDashboardVisibility,
  resetDashboardVisibility: (state: SystemSlice) =>
    state.resetDashboardVisibility,
};

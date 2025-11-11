import {useQuery} from '@tanstack/react-query';
import {dashboardApi} from '@vohrad/api-client';
import {shallow} from 'zustand/shallow';
import {useAuthStore} from '../../store';
import {systemSelectors} from './selectors';
import type {DashboardCardKey, DashboardVisibilityState} from './slice';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useDashboardOverview() {
  const {isAuthenticated, hasHydrated} = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      hasHydrated: state._hasHydrated,
    }),
    shallow,
  );

  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return response.data;
    },
    enabled: isAuthenticated && hasHydrated,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useDashboardVisibility(): DashboardVisibilityState {
  return useAuthStore(systemSelectors.dashboardVisibility, shallow);
}

export function useSetDashboardVisibility(): (
  key: DashboardCardKey,
  value: boolean,
) => void {
  return useAuthStore(systemSelectors.setDashboardVisibility);
}

export function useResetDashboardVisibility(): () => void {
  return useAuthStore(systemSelectors.resetDashboardVisibility);
}

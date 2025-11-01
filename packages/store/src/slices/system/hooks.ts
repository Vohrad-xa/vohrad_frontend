import {useCallback, useEffect} from 'react';
import {dashboardApi} from '@vohrad/api-client';
import {shallow} from 'zustand/shallow';
import {useAuthStore} from '../../store';
import {systemSelectors} from './selectors';
import type {DashboardCardKey, DashboardVisibilityState} from './slice';

export function useDashboardOverview() {
  const {
    data,
    status,
    error,
    setDashboardOverview,
    setDashboardOverviewStatus,
    setDashboardOverviewError,
  } = useAuthStore(
    (state) => ({
      data: systemSelectors.dashboardOverview(state),
      status: systemSelectors.dashboardOverviewStatus(state),
      error: systemSelectors.dashboardOverviewError(state),
      setDashboardOverview: systemSelectors.setDashboardOverview(state),
      setDashboardOverviewStatus:
        systemSelectors.setDashboardOverviewStatus(state),
      setDashboardOverviewError:
        systemSelectors.setDashboardOverviewError(state),
    }),
    shallow,
  );

  const {isAuthenticated, hasHydrated} = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      hasHydrated: state._hasHydrated,
    }),
    shallow,
  );

  const ensureIdleState = useCallback(() => {
    setDashboardOverview(null);
    setDashboardOverviewStatus('idle');
    setDashboardOverviewError(null);
  }, [
    setDashboardOverview,
    setDashboardOverviewStatus,
    setDashboardOverviewError,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      ensureIdleState();
    }
  }, [isAuthenticated, ensureIdleState]);

  const fetchOverview = useCallback(async (): Promise<void> => {
    if (!hasHydrated || !isAuthenticated) {
      return;
    }

    const currentStatus = useAuthStore.getState().dashboardOverviewStatus;
    if (currentStatus === 'loading') {
      return;
    }

    setDashboardOverviewStatus('loading');
    setDashboardOverviewError(null);

    try {
      const response = await dashboardApi.getOverview();
      setDashboardOverview(response.data);
      setDashboardOverviewStatus('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch overview';
      setDashboardOverviewError(message);
      setDashboardOverviewStatus('error');
      throw err;
    }
  }, [
    hasHydrated,
    isAuthenticated,
    setDashboardOverviewStatus,
    setDashboardOverviewError,
    setDashboardOverview,
  ]);

  useEffect(() => {
    if (isAuthenticated && hasHydrated && status === 'idle') {
      fetchOverview().catch(() => {});
    }
  }, [isAuthenticated, hasHydrated, status, fetchOverview]);

  return {
    data,
    isLoading: status === 'loading',
    error,
    status,
    fetchOverview,
  };
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

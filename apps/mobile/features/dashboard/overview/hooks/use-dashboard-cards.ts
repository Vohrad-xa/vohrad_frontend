import {useCallback, useMemo} from 'react';
import {
  useDashboardOverview,
  useDashboardVisibility,
  useSetDashboardVisibility,
  useResetDashboardVisibility,
  type DashboardCardKey,
} from '@sykamore/store';
import type {IconName} from '@/utils/icons';
import {CARD_CONFIG, OVERVIEW_FIELD_BY_KEY} from '../constants/card-config';

type MenuCard = {
  title: string;
  icon: IconName;
  count: number;
};

export function useDashboardCardControls() {
  const setVisibility = useSetDashboardVisibility();
  const resetVisibility = useResetDashboardVisibility();
  const visibility = useDashboardVisibility();

  const setCardVisibility = useCallback(
    (key: DashboardCardKey, value: boolean) => {
      setVisibility(key, value);
    },
    [setVisibility],
  );

  const reset = useCallback(() => {
    resetVisibility();
  }, [resetVisibility]);

  return {
    visibility,
    setCardVisibility,
    resetVisibility: reset,
    cardConfig: CARD_CONFIG,
  };
}

export function useFilteredDashboardCards(): MenuCard[] {
  const {data: overview} = useDashboardOverview();
  const visibility = useDashboardVisibility();

  return useMemo(() => {
    return CARD_CONFIG.filter(({key}) => visibility[key]).map(
      ({key, title, icon}) => ({
        title,
        icon,
        count: overview ? (overview[OVERVIEW_FIELD_BY_KEY[key]] as number) : 0,
      }),
    );
  }, [overview, visibility]);
}

export function getDashboardCardConfig() {
  return CARD_CONFIG;
}

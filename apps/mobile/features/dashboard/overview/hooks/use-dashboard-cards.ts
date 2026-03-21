import {useCallback, useMemo} from 'react';
import {
  useDashboardOverview,
  useDashboardVisibility,
  useSetDashboardVisibility,
  useResetDashboardVisibility,
  type DashboardCardKey,
} from '@sykamore/store';
import {
  CARD_CONFIG,
  OVERVIEW_FIELD_BY_KEY,
  type DashboardCardConfig,
} from '../constants/card-config';

type MenuCard = Omit<DashboardCardConfig, 'key'> & {
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
      ({key, title, icon, iosIcon, iconBackgroundColor}) => ({
        title,
        icon,
        iosIcon,
        iconBackgroundColor,
        count: overview ? (overview[OVERVIEW_FIELD_BY_KEY[key]] as number) : 0,
      }),
    );
  }, [overview, visibility]);
}

export function getDashboardCardConfig() {
  return CARD_CONFIG;
}

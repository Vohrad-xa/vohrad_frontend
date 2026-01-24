import {useCallback, useMemo} from 'react';
import {
  useDashboardOverview,
  useDashboardVisibility,
  useSetDashboardVisibility,
  useResetDashboardVisibility,
  type DashboardCardKey,
  type DashboardVisibilityState,
} from '@sykamore/store';
import type {MenuCard} from '@/types';
import {AppIcons} from '@/utils/icons';
import type {DashboardOverview} from '@sykamore/api-client';

type DashboardCardConfig = {
  key: DashboardCardKey;
  title: string;
  icon: MenuCard['icon'];
  colorToken: MenuCard['colorToken'];
};

const CARD_CONFIG: DashboardCardConfig[] = [
  {
    key: 'items',
    title: 'Items',
    icon: AppIcons.domain.itemOutline,
    colorToken: 'tint2',
  },
  {
    key: 'locations',
    title: 'Locations',
    icon: AppIcons.domain.location,
    colorToken: 'tint2',
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    icon: AppIcons.domain.maintenance,
    colorToken: 'tint2',
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    icon: AppIcons.domain.supplier,
    colorToken: 'tint2',
  },
  {
    key: 'checkInOut',
    title: 'Check In/Out',
    icon: AppIcons.actions.move,
    colorToken: 'tint2',
  },
  {
    key: 'attachments',
    title: 'Vault',
    icon: AppIcons.domain.vaultOutline,
    colorToken: 'tint2',
  },
];

const OVERVIEW_FIELD_BY_KEY: Record<DashboardCardKey, keyof DashboardOverview> =
  {
    items: 'items_total',
    locations: 'locations_total',
    maintenance: 'maintenance_total',
    suppliers: 'suppliers_total',
    checkInOut: 'check_in_out_total',
    attachments: 'attachments_total',
  };

export function useDashboardCardVisibility(): DashboardVisibilityState {
  return useDashboardVisibility();
}

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
      ({key, title, icon, colorToken}) => ({
        title,
        icon,
        colorToken,
        count: overview ? (overview[OVERVIEW_FIELD_BY_KEY[key]] as number) : 0,
      }),
    );
  }, [overview, visibility]);
}

export function getDashboardCardConfig() {
  return CARD_CONFIG;
}

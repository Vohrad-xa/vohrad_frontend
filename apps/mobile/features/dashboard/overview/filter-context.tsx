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
    icon: AppIcons.features.item,
    colorToken: 'accentBlue',
  },
  {
    key: 'locations',
    title: 'Locations',
    icon: AppIcons.features.location,
    colorToken: 'accentGreen',
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    icon: AppIcons.features.maintenance,
    colorToken: 'accentOrange',
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    icon: AppIcons.features.supplier,
    colorToken: 'accentDeepblue',
  },
  {
    key: 'checkInOut',
    title: 'Check In/Out',
    icon: AppIcons.actions.move,
    colorToken: 'destructive',
  },
  {
    key: 'attachments',
    title: 'Vault',
    icon: AppIcons.features.vault,
    colorToken: 'accentBlue',
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

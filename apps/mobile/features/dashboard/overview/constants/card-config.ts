import {AppIcons} from '@/utils/icons';
import type {IconName} from '@/utils/icons';
import type {DashboardOverview} from '@sykamore/api-client';
import type {DashboardCardKey} from '@sykamore/store';

export type DashboardCardConfig = {
  key: DashboardCardKey;
  title: string;
  icon: IconName;
};

export const CARD_CONFIG: DashboardCardConfig[] = [
  {key: 'items', title: 'Items', icon: AppIcons.domain.itemOutline},
  {key: 'locations', title: 'Locations', icon: AppIcons.domain.location},
  {key: 'maintenance', title: 'Maintenance', icon: AppIcons.domain.maintenance},
  {key: 'suppliers', title: 'Suppliers', icon: AppIcons.domain.supplier},
  {key: 'checkInOut', title: 'Check In/Out', icon: AppIcons.actions.move},
  {key: 'attachments', title: 'Vault', icon: AppIcons.domain.vaultOutline},
];

export const OVERVIEW_FIELD_BY_KEY: Record<
  DashboardCardKey,
  keyof DashboardOverview
> = {
  items: 'items_total',
  locations: 'locations_total',
  maintenance: 'maintenance_total',
  suppliers: 'suppliers_total',
  checkInOut: 'check_in_out_total',
  attachments: 'attachments_total',
};

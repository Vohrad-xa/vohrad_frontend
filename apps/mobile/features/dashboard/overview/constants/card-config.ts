import type {ThemeColorTokenName} from '@/constants';
import {type IconName, AppIcons} from '@/utils/icons';
import type {DashboardOverview} from '@sykamore/api-client';
import type {DashboardCardKey} from '@sykamore/store';
import type {SFSymbol} from 'expo-symbols';

export type DashboardCardConfig = {
  key: DashboardCardKey;
  title: string;
  icon: IconName;
  iosIcon?: SFSymbol;
  iconBackgroundColor: ThemeColorTokenName;
};

export const CARD_CONFIG: DashboardCardConfig[] = [
  {
    key: 'items',
    title: 'Items',
    icon: AppIcons.domain.item,
    iosIcon: 'rectangle.3.offgrid.fill',
    iconBackgroundColor: 'accentBlue',
  },
  {
    key: 'locations',
    title: 'Locations',
    icon: AppIcons.domain.location,
    iosIcon: 'location.fill',
    iconBackgroundColor: 'accentGreen',
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    icon: AppIcons.domain.maintenance,
    iosIcon: 'wrench.fill',
    iconBackgroundColor: 'accentOrange',
  },
  {
    key: 'suppliers',
    title: 'Suppliers',
    icon: AppIcons.domain.supplier,
    iosIcon: 'cart.fill',
    iconBackgroundColor: 'accentTeal',
  },
  {
    key: 'checkInOut',
    title: 'Check In/Out',
    icon: AppIcons.actions.move,
    iconBackgroundColor: 'accentIndigo',
  },
  {
    key: 'attachments',
    title: 'Vault',
    icon: AppIcons.domain.vault,
    iosIcon: 'internaldrive.fill',
    iconBackgroundColor: 'accentPurple',
  },
  {
    key: 'categories',
    title: 'Categories',
    icon: AppIcons.domain.category,
    iosIcon: 'square.grid.2x2.fill',
    iconBackgroundColor: 'accentOrange',
  },
  {
    key: 'transfers',
    title: 'Transfers',
    icon: AppIcons.domain.transfer,
    iconBackgroundColor: 'accentTeal',
  },
  {
    key: 'unitsOfMeasure',
    title: 'Units of Measure',
    icon: AppIcons.domain.unitOfMeasure,
    iosIcon: 'ruler.fill',
    iconBackgroundColor: 'accentBlue',
  },
  {
    key: 'events',
    title: 'Events',
    icon: AppIcons.ui.notifications,
    iosIcon: 'bell.fill',
    iconBackgroundColor: 'accentRed',
  },
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
  categories: 'categories_total',
  transfers: 'transfers_total',
  unitsOfMeasure: 'uom_total',
  events: 'events_total',
};

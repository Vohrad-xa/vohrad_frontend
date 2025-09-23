import type {MenuItemProps} from '@/types/ui';

export interface SettingsItem extends Omit<MenuItemProps, 'onPress'> {
  id: string;
  onPress?: () => void;
  showDividerAfter?: boolean;
}

export interface ToggleSettingsItem extends SettingsItem {
  hasToggle: true;
}

export interface DividerItem {
  id: string;
  isDivider: true;
}

export type ListItem = SettingsItem | ToggleSettingsItem | DividerItem;

export const isDividerItem = (item: ListItem): item is DividerItem => 'isDivider' in item;

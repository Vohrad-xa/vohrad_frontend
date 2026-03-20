import type {TokenName} from '@/constants';
import type {IconName} from '@/utils';

type SettingsActionVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'ghost';

export interface SettingsItem {
  id: string;
  label: string;
  icon: IconName;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  iconColor?: string;
  iconColorToken?: TokenName;
  variant?: SettingsActionVariant;
  isDestructive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onLongPress?: () => void;
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

export const isDividerItem = (item: ListItem): item is DividerItem =>
  'isDivider' in item;

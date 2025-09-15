import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tokens, type TokenName } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';
import { DesignSystem } from '@/constants/typography';

export type IconName =
  // Navigation & UI
  | 'home'
  | 'home-outline'
  | 'menu'
  | 'close'
  | 'chevron-forward'
  | 'chevron-forward-outline'
  | 'chevron-back'
  | 'chevron-up'
  | 'chevron-down'
  | 'search'
  | 'settings-outline'
  | 'help-circle-outline'
  | 'information-circle-outline'
  | 'exit-outline'

  // Inventory & Management
  | 'cube-outline'
  | 'layers-outline'
  | 'swap-horizontal'
  | 'build'
  | 'construct-outline'
  | 'hardware-chip-outline'
  | 'log-in'
  | 'log-out'
  | 'bar-chart-outline'
  | 'stats-chart-outline'

  // Actions
  | 'camera'
  | 'qr-code'
  | 'barcode-outline'
  | 'barcode-viewfinder'
  | 'keypad'
  | 'pencil'
  | 'add'
  | 'add-circle-outline'
  | 'checkmark'
  | 'trash'
  | 'edit'

  // Content & Files
  | 'document-text'
  | 'folder'
  | 'image'
  | 'download'
  | 'upload'
  | 'save'
  | 'print'

  // People & Social
  | 'person-circle'
  | 'person-outline'
  | 'people'
  | 'mail'
  | 'call'

  // Business
  | 'car'
  | 'business'
  | 'storefront'
  | 'card'
  | 'cash'

  // Status & Alerts
  | 'checkmark-circle'
  | 'checkmark-circle-outline'
  | 'close-circle-outline'
  | 'alert-circle-outline'
  | 'warning'
  | 'alert-circle'
  | 'time'
  | 'calendar'

  // System
  | 'wifi'
  | 'battery-full'
  | 'notifications'
  | 'refresh'
  | 'sync'
  | 'remove';

type IconSizeKey = keyof typeof DesignSystem.iconSize; // xs|sm|md|lg|xl|xxl

interface IconProps {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string | OpaqueColorValue;
  colorToken?: TokenName; // prefer passing a token over raw color
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', color, colorToken, style }) => {
  const { scheme } = useTheme();
  const resolvedSize = typeof size === 'number' ? size : (DesignSystem.iconSize[size] ?? DesignSystem.iconSize.md);
  const resolvedColor = color ?? (colorToken ? Tokens[scheme][colorToken] : Tokens[scheme].icon);

  return (
    <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={resolvedSize} color={resolvedColor} style={style} />
  );
};

export const IconPresets = {
  small: { size: 'sm' as IconSizeKey },
  medium: { size: 'md' as IconSizeKey },
  large: { size: 'lg' as IconSizeKey },
  xlarge: { size: 'xxl' as IconSizeKey },
} as const;

export const AppIcons = {
  navigation: {
    home: 'home-outline' as IconName,
    menu: 'menu' as IconName,
    back: 'chevron-back' as IconName,
    forward: 'chevron-forward' as IconName,
    close: 'close' as IconName,
  },

  inventory: {
    items: 'cube-outline' as IconName,
    categories: 'layers-outline' as IconName,
    locations: 'storefront' as IconName,
    search: 'search' as IconName,
  },

  actions: {
    scan: 'qr-code' as IconName,
    camera: 'camera' as IconName,
    input: 'keypad' as IconName,
    edit: 'pencil' as IconName,
    save: 'checkmark' as IconName,
    delete: 'trash' as IconName,
  },

  content: {
    document: 'document-text' as IconName,
    folder: 'folder' as IconName,
    image: 'image' as IconName,
    download: 'download' as IconName,
  },

  status: {
    success: 'checkmark-circle' as IconName,
    warning: 'warning' as IconName,
    error: 'alert-circle' as IconName,
    info: 'information-circle-outline' as IconName,
  },

  business: {
    supplier: 'car' as IconName,
    suppliers: 'business' as IconName,
    profile: 'person-outline' as IconName,
    equipment: 'hardware-chip-outline' as IconName,
    maintenance: 'construct-outline' as IconName,
    reports: 'bar-chart-outline' as IconName,
  },
} as const;

export default Icon;

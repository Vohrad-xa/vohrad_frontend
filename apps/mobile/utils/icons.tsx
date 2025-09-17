import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type TokenName } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';

export type IconName =
  // Navigation & UI
  | 'home-outline'
  | 'reorder-two-outline'
  | 'close-outline'
  | 'chevron-forward-outline'
  | 'chevron-back-outline'
  | 'chevron-up-outline'
  | 'chevron-down-outline'
  | 'search-outline'
  | 'settings-outline'
  | 'help-circle-outline'
  | 'information-circle-outline'
  | 'exit-outline'

  // Inventory & Management
  | 'cube-outline'
  | 'layers-outline'
  | 'swap-horizontal-outline'
  | 'build-outline'
  | 'construct-outline'
  | 'hardware-chip-outline'
  | 'log-in-outline'
  | 'log-out-outline'
  | 'bar-chart-outline'
  | 'stats-chart-outline'

  // Actions
  | 'camera-outline'
  | 'qr-code-outline'
  | 'barcode-outline'
  | 'keypad-outline'
  | 'pencil-outline'
  | 'add-outline'
  | 'add-circle-outline'
  | 'checkmark-outline'
  | 'trash-outline'

  // Content & Files
  | 'document-text-outline'
  | 'folder-outline'
  | 'image-outline'
  | 'download-outline'
  | 'cloud-upload-outline'
  | 'save-outline'
  | 'print-outline'

  // People & Social
  | 'person-circle-outline'
  | 'person-outline'
  | 'people-outline'
  | 'mail-outline'
  | 'call-outline'

  // Business
  | 'car-outline'
  | 'business-outline'
  | 'storefront-outline'
  | 'location-outline'
  | 'card-outline'
  | 'cash-outline'

  // Status & Alerts
  | 'checkmark-circle-outline'
  | 'close-circle-outline'
  | 'alert-circle-outline'
  | 'warning-outline'
  | 'time-outline'
  | 'calendar-outline'

  // System
  | 'wifi-outline'
  | 'battery-full-outline'
  | 'notifications-outline'
  | 'refresh-outline'
  | 'sync-outline'
  | 'remove-outline';

type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface IconProps {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string | OpaqueColorValue;
  colorToken?: TokenName; // prefer passing a token over raw color
  style?: StyleProp<TextStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 28, color, colorToken, style }) => {
  const { scheme, theme, ds } = useTheme();
  const resolvedSize = typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);
  const resolvedColor = color ?? (colorToken ? theme[colorToken] : theme.icon);

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
    menu: 'reorder-two-outline' as IconName,
    settings: 'settings-outline' as IconName,
    scan: 'barcode-outline' as IconName,
    profile: 'person-outline' as IconName,
    back: 'chevron-back-outline' as IconName,
    forward: 'chevron-forward-outline' as IconName,
    close: 'close-outline' as IconName,
  },

  inventory: {
    items: 'cube-outline' as IconName,
    categories: 'layers-outline' as IconName,
    locations: 'storefront-outline' as IconName,
    search: 'search-outline' as IconName,
  },

  actions: {
    scan: 'qr-code-outline' as IconName,
    camera: 'camera-outline' as IconName,
    input: 'keypad-outline' as IconName,
    edit: 'pencil-outline' as IconName,
    save: 'checkmark-outline' as IconName,
    delete: 'trash-outline' as IconName,
  },

  content: {
    document: 'document-text-outline' as IconName,
    folder: 'folder-outline' as IconName,
    image: 'image-outline' as IconName,
    download: 'download-outline' as IconName,
  },

  status: {
    success: 'checkmark-circle-outline' as IconName,
    warning: 'warning-outline' as IconName,
    error: 'alert-circle-outline' as IconName,
    info: 'information-circle-outline' as IconName,
  },

  business: {
    supplier: 'car-outline' as IconName,
    suppliers: 'business-outline' as IconName,
    profile: 'person-outline' as IconName,
    equipment: 'hardware-chip-outline' as IconName,
    maintenance: 'construct-outline' as IconName,
    reports: 'bar-chart-outline' as IconName,
  },
} as const;

export default Icon;

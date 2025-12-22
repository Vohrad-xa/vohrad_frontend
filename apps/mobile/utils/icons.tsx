import React from 'react';
import type {OpaqueColorValue, StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import {Ionicons, FontAwesome} from '@expo/vector-icons';
import {type TokenName} from '@/constants/colors';
import {useTheme} from '@/providers/theme-provider';

export type IconName = string;

type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface IconProps {
  name: IconName;
  useSwiftUI?: boolean;
  size?: number | IconSizeKey;
  color?: string | OpaqueColorValue;
  colorToken?: TokenName;
  tintColor?: string;
  style?: StyleProp<TextStyle>;
  noContainer?: boolean;
  withBackground?: boolean;
  accessibilityLabel?: string;
}

export const IconFontFamily = 'Ionicons' as const;

export function getIconGlyph(name: IconName): string | undefined {
  const glyph = Ionicons.glyphMap[name as keyof typeof Ionicons.glyphMap];
  if (glyph == null) {
    return undefined;
  }
  return typeof glyph === 'number' ? String.fromCodePoint(glyph) : glyph;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  colorToken,
  tintColor,
  style,
  withBackground,
}) => {
  const {theme, ds} = useTheme();
  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);
  const resolvedToken = colorToken;
  const backgroundColor =
    tintColor ?? color ?? (resolvedToken ? theme[resolvedToken] : theme.icon);

  const iconColor = withBackground ? '#FFFFFF' : backgroundColor;

  const iconElement =
    name in FontAwesome.glyphMap ? (
      <FontAwesome
        name={name as keyof typeof FontAwesome.glyphMap}
        size={resolvedSize}
        color={iconColor}
        style={style}
      />
    ) : (
      <Ionicons
        name={name as keyof typeof Ionicons.glyphMap}
        size={resolvedSize}
        color={iconColor}
        style={style}
      />
    );

  // If withBackground, wrap in a circular container
  if (withBackground) {
    const containerSize = resolvedSize * 2;
    return (
      <View
        style={{
          width: containerSize / 1.2,
          height: containerSize / 1.2,
          borderRadius: containerSize / 2,
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {iconElement}
      </View>
    );
  }

  return iconElement;
};

export const AppIcons = {
  navigation: {
    home: 'home' as IconName,
    menu: 'menu-outline' as IconName,
    settings: 'cog-outline' as IconName,
    scan: 'scan-outline' as IconName,
    profile: 'person-outline' as IconName,
    event: 'notifications-outline' as IconName,
    vault: 'folder-open-sharp' as IconName,
    filter: 'filter-outline' as IconName,
    back: 'arrow-back' as IconName,
    forward: 'chevron-forward-outline' as IconName,
    close: 'close-outline' as IconName,
    chevron: 'chevron-forward-outline' as IconName,
    more: 'ellipsis-horizontal' as IconName,
    preferences: 'options-outline' as IconName,
    chevronRight: 'chevron-forward-outline' as IconName,
  },

  inventory: {
    item: 'albums-outline' as IconName,
    itemsSecondary: 'albums' as IconName,
    category: 'layers-outline' as IconName,
    location: 'location-outline' as IconName,
    search: 'search-outline' as IconName,
  },

  actions: {
    scan: 'scan-outline' as IconName,
    camera: 'camera-outline' as IconName,
    input: 'keypad-outline' as IconName,
    edit: 'pencil-square-o' as IconName,
    add: 'add-outline' as IconName,
    addUser: 'person-add-outline' as IconName,
    addItem: 'duplicate-outline' as IconName,
    save: 'checkmark-outline' as IconName,
    delete: 'trash-outline' as IconName,
    share: 'share-outline' as IconName,
    refresh: 'refresh-outline' as IconName,
    move: 'return-down-forward-outline' as IconName,
    logout: 'exit-outline' as IconName,
    close: 'close-outline' as IconName,
    download: 'cloud-download-outline' as IconName,
  },

  content: {
    document: 'document-text-outline' as IconName,
    folder: 'folder-outline' as IconName,
    folderOpen: 'folder-open-sharp' as IconName,
    file: 'file' as IconName,
    image: 'image-outline' as IconName,
    archive: 'archive-outline' as IconName,
    imageFallback: 'image-outline' as IconName,
    export: 'share-outline' as IconName,
    print: 'print-outline' as IconName,
    language: 'planet-outline' as IconName,
    privacy: 'lock-closed-outline' as IconName,
    search: 'search-outline' as IconName,
    list: 'list-outline' as IconName,
    terms: 'document-text-outline' as IconName,
    calendar: 'calendar-outline' as IconName,
  },

  status: {
    success: 'checkmark-circle-outline' as IconName,
    warning: 'warning-outline' as IconName,
    error: 'alert-circle-outline' as IconName,
    info: 'information-circle-outline' as IconName,
    help: 'help-circle-outline' as IconName,
    time: 'time-outline' as IconName,
  },

  business: {
    supplier: 'cart-outline' as IconName,
    profile: 'person-outline' as IconName,
    plan: 'card-outline' as IconName,
    organization: 'business-outline' as IconName,
    equipment: 'hardware-chip-outline' as IconName,
    maintenance: 'flash-outline' as IconName,
    reports: 'bar-chart-outline' as IconName,
  },

  theme: {
    appearance: 'sparkles-outline' as IconName,
  },

  settings: {
    biometric: 'finger-print' as IconName,
    haptic: 'phone-portrait-outline' as IconName,
  },
} as const;

export default Icon;

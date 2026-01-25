import React from 'react';
import {type StyleProp, type ViewStyle, View} from 'react-native';
import {
  SymbolView,
  type AndroidSymbol,
  type SymbolWeight,
  type ContentMode,
} from 'expo-symbols';
import type {TokenName} from '@/constants';
import {useTheme} from '@/providers/theme-provider';

export type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

export type IconProps = {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string;
  colorToken?: TokenName;
  fontWeight?: SymbolWeight;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  withBackground?: boolean;
  useSwiftUI?: boolean;
  noContainer?: boolean;
  symbolType?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  symbolColorTokens?: TokenName[];
  scale?: number | string;
  resizeMode?: ContentMode;
  animationSpec?: Record<string, unknown>;
};

export type IconName = AndroidSymbol;

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'lg',
  color,
  colorToken,
  style,
  fontWeight = 'regular',
  accessibilityLabel,
  resizeMode,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);

  const foreground = color ?? (colorToken ? theme[colorToken] : theme.icon);

  return (
    <View style={[style]}>
      <SymbolView
        name={{
          android: name,
          web: name,
        }}
        size={resolvedSize}
        tintColor={foreground}
        weight={fontWeight}
        resizeMode={resizeMode}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
};

export const AppIcons = {
  ui: {
    more: 'more_vert',
    menu: 'menu',
    filter: 'filter_list',
    search: 'search',
    chevronUpDown: 'unfold_more',
    notifications: 'notifications',
    settings: 'settings',
    appearance: 'contrast',
    biometric: 'fingerprint',
    haptic: 'vibration',
    language: 'language',
    privacy: 'lock',
    terms: 'description',
    plan: 'credit_card',
    info: 'info',
    help: 'help',
    time: 'schedule',
    profile: 'person',
    userManagement: 'people',
    support: 'support',
    preference: 'tune',
  },

  actions: {
    close: 'close',
    forward: 'chevron_right',
    back: 'chevron_left',
    add: 'add',
    save: 'check',
    share: 'share',
    delete: 'delete',
    refresh: 'refresh',
    logout: 'logout',
    download: 'download',
    edit: 'edit',
    addUser: 'person_add',
    addItem: 'library_add',
    move: 'subdirectory_arrow_right',
    scan: 'qr_code_scanner',
    camera: 'photo_camera',
    input: 'keyboard',
    select: 'check_circle',
    enableTorch: 'flash_on',
    disableTorch: 'flash_off',
  },

  domain: {
    item: 'grid_view',
    itemOutline: 'grid_view',
    vault: 'folder_open',
    vaultOutline: 'folder_open',
    home: 'home',
    homeOutline: 'home',
    settings: 'settings',
    settingsOutline: 'settings',
    category: 'category',
    location: 'location_on',
    supplier: 'shopping_cart',
    organization: 'domain',
    maintenance: 'build',
  },

  files: {
    document: 'description',
    folder: 'folder_open',
    file: 'insert_drive_file',
    image: 'image',
    archive: 'archive',
    print: 'print',
    list: 'list',
    others: 'folder',
    pdf: 'picture_as_pdf',
    word: 'docs',
    excel: 'docs',
    ppt: 'slideshow',
    text: 'text_snippet',
  },

  status: {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    pending: 'pending',
  },

  emptyStates: {
    user: 'people',
    file: 'folder_open',
  },
} as const satisfies Record<string, Record<string, IconName>>;

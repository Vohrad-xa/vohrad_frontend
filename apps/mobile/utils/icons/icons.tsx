import {type StyleProp, type TextStyle} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type {TokenName} from '@/constants';
import {useTheme} from '@/providers/theme-provider';

export type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

export type IconProps = {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string;
  colorToken?: TokenName;
  fontWeight?: string;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
  withBackground?: boolean;
  useSwiftUI?: boolean;
  noContainer?: boolean;
  symbolType?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  symbolColorTokens?: TokenName[];
  scale?: number | string;
  resizeMode?: string;
  animationSpec?: Record<string, unknown>;
};

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function getIconGlyph(name: IconName): string | undefined {
  // TS-safe indexing (some vector-icons typings are picky here)
  const glyphMap = MaterialCommunityIcons.glyphMap as unknown as Record<
    IconName,
    number | string
  >;

  const glyph = glyphMap[name];
  if (glyph == null) return undefined;
  return typeof glyph === 'number' ? String.fromCodePoint(glyph) : glyph;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'lg',
  color,
  colorToken,
  style,
  accessibilityLabel,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);

  const foreground = color ?? (colorToken ? theme[colorToken] : theme.icon);
  const iconColor = foreground ?? theme.icon;

  const iconElement = (
    <MaterialCommunityIcons
      name={name}
      size={resolvedSize}
      color={iconColor}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );

  return iconElement;
};

export const AppIcons = {
  ui: {
    close: 'close',
    back: 'arrow-left',
    more: 'dots-vertical',
    menu: 'menu',
    chevronRight: 'chevron-right',
    chevronLeft: 'chevron-left',
    filter: 'filter-variant',
    search: 'magnify',
    chevronUpDown: 'unfold-more-horizontal',
  },

  tabs: {
    home: 'home',
    vault: 'cloud-lock',
    settings: 'file-cog-outline',
    profile: 'account-outline',
    notifications: 'bell-outline',
    item: 'view-dashboard',
  },

  actions: {
    add: 'plus',
    addUser: 'account-plus-outline',
    addItem: 'content-duplicate',
    edit: 'pencil-outline',
    delete: 'delete',
    save: 'check',
    close: 'close',
    share: 'share-variant',
    refresh: 'refresh',
    move: 'arrow-up-right',
    download: 'cloud-download',
    scan: 'line-scan',
    camera: 'camera-outline',
    input: 'keyboard-outline',
    logout: 'logout-variant',
    enableTorch: 'flash',
    disableTorch: 'flash-off',
  },

  features: {
    item: 'card-multiple-outline',
    category: 'view-grid-outline',
    location: 'map-marker-radius-outline',
    search: 'magnify',
    supplier: 'cart-outline',
    organization: 'briefcase-variant-outline',
    maintenance: 'folder-wrench-outline',
    support: 'help-circle-outline',
    userManagement: 'account-supervisor-outline',
    attachments: 'file-document-outline',
  },

  files: {
    document: 'file-document-outline',
    folder: 'folder',
    file: 'file-outline',
    image: 'image-outline',
    imageFallback: 'image-off-outline',
    archive: 'archive-outline',
    print: 'printer-outline',
    list: 'format-list-bulleted',
    others: 'folder-question-outline',
    empty: 'folder-question-outline',
    test: 'information-outline',
    pdf: 'file-document-outline',
    word: 'file-word-outline',
    excel: 'file-excel-outline',
    ppt: 'file-powerpoint-outline',
    text: 'file-outline',
  },

  status: {
    success: 'check-circle-outline',
    warning: 'alert-outline',
    error: 'alert-circle-outline',
    info: 'information-outline',
    help: 'help-circle-outline',
    time: 'clock-outline',
  },

  preferences: {
    settings: 'tune',
    appearance: 'theme-light-dark',
    biometric: 'fingerprint',
    haptic: 'vibrate',
    language: 'translate',
    privacy: 'lock-outline',
    terms: 'file-document-outline',
    plan: 'credit-card-outline',
  },
} as const satisfies Record<string, Record<string, IconName>>;

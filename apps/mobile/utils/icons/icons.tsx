import {type StyleProp, type TextStyle} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type {TokenName} from '@/constants';
import {useTheme} from '@/providers';

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
    more: 'dots-vertical',
    filter: 'filter-variant',
    search: 'magnify',
    chevronUpDown: 'unfold-more-horizontal',
    notifications: 'bell-outline',
    settings: 'cog-outline',
    appearance: 'theme-light-dark',
    biometric: 'fingerprint',
    haptic: 'vibrate',
    language: 'earth',
    privacy: 'lock-outline',
    terms: 'file-document-outline',
    plan: 'credit-card-outline',
    info: 'information-outline',
    help: 'help-circle-outline',
    time: 'clock-outline',
    profile: 'account-outline',
    userManagement: 'account-multiple-outline',
    support: 'information-slab-circle-outline',
    preference: 'tune-variant',
    email: 'email-outline',
    phone: 'phone-outline',
    web: 'web',
    tax: 'bank-outline',
  },

  actions: {
    close: 'close',
    forward: 'chevron-right',
    back: 'chevron-left',
    add: 'plus',
    save: 'check',
    share: 'share-variant',
    delete: 'trash-can-outline',
    refresh: 'refresh',
    logout: 'logout',
    download: 'download',
    edit: 'circle-edit-outline',
    addUser: 'account-plus-outline',
    addItem: 'plus-box-outline',
    move: 'arrow-u-right-bottom',
    scan: 'qrcode-scan',
    camera: 'camera',
    input: 'keyboard-outline',
    select: 'check-circle-outline',
    enableTorch: 'flashlight',
    disableTorch: 'flashlight-off',
  },

  domain: {
    item: 'view-grid-outline',
    itemOutline: 'view-grid-outline',
    vault: 'folder-open-outline',
    vaultOutline: 'folder-open-outline',
    home: 'home',
    homeOutline: 'home-outline',
    settings: 'cog',
    settingsOutline: 'cog-outline',
    category: 'shape-outline',
    location: 'map-marker-outline',
    supplier: 'cart-outline',
    organization: 'domain',
    maintenance: 'wrench-cog-outline',
  },

  files: {
    document: 'file-document-outline',
    folder: 'folder-open-outline',
    file: 'file-outline',
    image: 'file-image-outline',
    archive: 'archive-outline',
    print: 'printer-outline',
    list: 'format-list-bulleted',
    others: 'folder-multiple-outline',
    pdf: 'file-pdf-box',
    word: 'file-word-outline',
    excel: 'file-excel-outline',
    text: 'file-document-outline',
  },

  status: {
    success: 'check-circle',
    warning: 'alert',
    error: 'alert-circle',
    pending: 'progress-clock',
  },

  emptyStates: {
    user: 'account-multiple-outline',
    file: 'folder-open-outline',
  },
} as const satisfies Record<string, Record<string, IconName>>;

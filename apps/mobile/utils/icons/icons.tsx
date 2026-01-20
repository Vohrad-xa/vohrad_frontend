import {type StyleProp, type TextStyle} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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

export type IconName = keyof typeof Ionicons.glyphMap;

export function getIconGlyph(name: IconName): string | undefined {
  const glyphMap = Ionicons.glyphMap as unknown as Record<
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
  const iconColor = foreground;

  const iconElement = (
    <Ionicons
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
    more: 'ellipsis-vertical',
    menu: 'menu',
    filter: 'filter',
    search: 'search-outline',
    chevronUpDown: 'chevron-expand',
    notifications: 'notifications-outline',
    settings: 'settings-outline',
    appearance: 'contrast-outline',
    biometric: 'finger-print-outline',
    haptic: 'phone-portrait-outline',
    language: 'globe-outline',
    privacy: 'lock-closed-outline',
    terms: 'document-text-outline',
    plan: 'card-outline',
    info: 'information-circle-outline',
    help: 'help-circle-outline',
    time: 'time-outline',
    profile: 'person-outline',
    userManagement: 'people-outline',
    support: 'help-circle-outline',
    preference: 'options-outline',
  },

  actions: {
    close: 'close',
    forward: 'chevron-forward',
    back: 'chevron-back',
    add: 'add',
    save: 'checkmark',
    share: 'share-outline',
    delete: 'trash-outline',
    refresh: 'refresh',
    logout: 'arrow-forward-circle-outline',
    download: 'cloud-download-outline',
    edit: 'pencil',
    addUser: 'person-add-outline',
    addItem: 'duplicate-outline',
    move: 'return-down-forward',
    scan: 'scan-outline',
    camera: 'camera-outline',
    input: 'keypad-outline',
    enableTorch: 'flash',
    disableTorch: 'flash-off',
  },

  domain: {
    item: 'grid',
    itemOutline: 'grid-outline',
    vault: 'folder-open',
    vaultOutline: 'folder-outline',
    home: 'home',
    homeOutline: 'home-outline',
    settings: 'settings',
    settingsOutline: 'settings-outline',
    category: 'apps-outline',
    location: 'location-outline',
    supplier: 'cart-outline',
    organization: 'business-outline',
    maintenance: 'build-outline',
  },

  files: {
    document: 'document-text-outline',
    folder: 'folder-open-outline',
    file: 'document-outline',
    image: 'image-outline',
    archive: 'archive-outline',
    print: 'print-outline',
    list: 'list',
    pdf: 'document-text-outline',
    word: 'document-outline',
    excel: 'document-outline',
    ppt: 'document-outline',
    text: 'document-outline',
  },

  status: {
    success: 'checkmark-circle-outline',
    warning: 'warning-outline',
    error: 'alert-circle-outline',
    pending: 'time-outline',
  },

  emptyStates: {
    user: 'people-outline',
    file: 'folder-open-outline',
  },
} as const satisfies Record<string, Record<string, IconName>>;

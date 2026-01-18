import {View, type StyleProp, type TextStyle} from 'react-native';
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
  withBackground,
  accessibilityLabel,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);

  const foreground = color ?? (colorToken ? theme[colorToken] : theme.icon);
  const iconColor = withBackground ? '#FFFFFF' : foreground;

  const iconElement = (
    <Ionicons
      name={name}
      size={resolvedSize}
      color={iconColor}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );

  if (withBackground) {
    return (
      <View
        style={{
          padding: 4,
          borderRadius: 50,
          backgroundColor: foreground,
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
  ui: {
    close: 'close',
    back: 'arrow-back',
    more: 'ellipsis-vertical',
    menu: 'menu',
    chevronRight: 'chevron-forward',
    chevronLeft: 'chevron-back',
    filter: 'filter',
    search: 'search',
    chevronUpDown: 'chevron-expand',
    notifications: 'notifications-outline',
  },

  tabs: {
    home: 'home',
    homeOutline: 'home-outline',
    vault: 'folder-open',
    vaultOutline: 'folder-outline',
    settings: 'settings',
    settingsOutline: 'settings-outline',
    profile: 'person-circle',
    profileOutline: 'person-circle-outline',
    item: 'grid',
    itemOutline: 'grid-outline',
  },

  actions: {
    add: 'add',
    addUser: 'person-add-outline',
    addItem: 'duplicate-outline',
    edit: 'pencil',
    delete: 'trash',
    save: 'checkmark',
    close: 'close',
    share: 'share-outline',
    refresh: 'refresh',
    move: 'return-down-forward',
    download: 'cloud-download-outline',
    scan: 'scan-outline',
    camera: 'camera-outline',
    input: 'keypad-outline',
    logout: 'arrow-forward-circle',
    enableTorch: 'flash',
    disableTorch: 'flash-off',
  },

  features: {
    item: 'grid-outline',
    category: 'apps-outline',
    location: 'location-outline',
    vault: 'folder-outline',
    search: 'search-outline',
    supplier: 'cart-outline',
    organization: 'compass',
    maintenance: 'build-outline',
    support: 'help-circle',
    userManagement: 'people-circle',
    attachments: 'document-text-outline',
  },

  files: {
    document: 'document-text-outline',
    folder: 'folder',
    file: 'document-outline',
    image: 'image-outline',
    imageFallback: 'image-outline',
    archive: 'archive-outline',
    print: 'print-outline',
    list: 'list',
    others: 'folder-open-outline',
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
    info: 'information-circle',
    help: 'help-circle',
    time: 'time-outline',
    pending: 'time-outline',
  },

  preferences: {
    settings: 'options',
    appearance: 'contrast',
    biometric: 'finger-print-outline',
    haptic: 'phone-portrait-outline',
    language: 'globe',
    privacy: 'lock-closed',
    terms: 'document-text',
    plan: 'card',
  },

  emptyStates: {
    user: 'people-outline',
    file: 'folder-open-outline',
  },
} as const satisfies Record<string, Record<string, IconName>>;

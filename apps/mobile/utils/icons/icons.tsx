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
  testID?: string;
  style?: StyleProp<TextStyle>;
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
  testID,
}) => {
  const {theme, ds, scheme} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);

  const foreground = color ?? (colorToken ? theme[colorToken] : theme.icon);

  const iconColor = foreground ?? theme.icon;

  const outlineName = `${name}-outline` as IconName;

  const resolvedName =
    scheme === 'light' && outlineName in Ionicons.glyphMap ? outlineName : name;

  return (
    <Ionicons
      name={resolvedName}
      size={resolvedSize}
      color={iconColor}
      style={style}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  );
};

export const AppIcons = {
  ui: {
    more: 'ellipsis-vertical',
    filter: 'filter',
    search: 'search',
    chevronUpDown: 'swap-vertical',
    notifications: 'notifications',
    settings: 'settings',
    appearance: 'contrast',
    biometric: 'finger-print',
    haptic: 'phone-portrait',
    language: 'earth',
    privacy: 'shield-checkmark',
    terms: 'document-text',
    plan: 'card',
    info: 'information-circle',
    help: 'help-circle',
    time: 'time',
    profile: 'person',
    userManagement: 'people',
    support: 'information-circle',
    preference: 'options',
    email: 'mail',
    phone: 'call',
    web: 'globe',
    tax: 'business',
    passKey: 'key',
    sessions: 'laptop',
    password: 'lock-closed',
  },

  actions: {
    close: 'close',
    forward: 'chevron-forward',
    back: 'chevron-back',
    add: 'add',
    save: 'save',
    share: 'share-social',
    delete: 'trash',
    refresh: 'refresh',
    logout: 'log-out',
    download: 'download',
    edit: 'create',
    addUser: 'person-add',
    addItem: 'add-circle',
    move: 'arrow-redo',
    scan: 'scan',
    camera: 'camera',
    input: 'keypad',
    select: 'checkmark-circle',
    enableTorch: 'flash',
    disableTorch: 'flash-off',
  },

  domain: {
    item: 'grid',
    vault: 'folder-open',
    home: 'home',
    homeOutline: 'home-outline',
    settings: 'settings',
    settingsOutline: 'settings-outline',
    category: 'shapes',
    location: 'location',
    supplier: 'cart',
    organization: 'business',
    maintenance: 'build',
    transfer: 'swap-horizontal',
    unitOfMeasure: 'resize',
  },

  files: {
    document: 'document-text',
    folder: 'folder-open',
    file: 'document',
    image: 'image',
    archive: 'archive',
    print: 'print',
    list: 'list',
    others: 'folder-open',
    pdf: 'document-text',
    word: 'document-text',
    excel: 'document-text',
    text: 'document-text',
  },

  status: {
    success: 'checkmark-circle',
    warning: 'warning',
    error: 'alert-circle',
    pending: 'time',
  },

  emptyStates: {
    user: 'people',
    file: 'folder-open',
  },
} as const satisfies Record<string, Record<string, IconName>>;

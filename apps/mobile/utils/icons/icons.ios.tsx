import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {SymbolView, type SFSymbol, type SymbolViewProps} from 'expo-symbols';
import {Palette, type TokenName} from '@/constants/colors';
import {useTheme} from '@/providers/theme-provider';
import {
  accessibilityLabel,
  background,
  Image,
  font,
  foregroundStyle,
  frame,
  type ViewModifier,
  cornerRadius,
} from 'sykamore-ui/ios';

export type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

export type IconName = SFSymbol;

type SymbolType = NonNullable<SymbolViewProps['type']>;
type SwiftUIFontWeight = NonNullable<Parameters<typeof font>[0]['weight']>;
type animation = NonNullable<SymbolViewProps['animationSpec']>;
type ContentMode = NonNullable<SymbolViewProps['resizeMode']>;
type SymbolScale = NonNullable<SymbolViewProps['scale']>;
// type SymbolWeight = NonNullable<SymbolViewProps['weight']>;

export type IconProps = {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string;
  colorToken?: TokenName;
  fontWeight?: SwiftUIFontWeight;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
  useSwiftUI?: boolean;
  container?: boolean;
  symbolType?: SymbolType;
  symbolColorTokens?: TokenName[];
  animationSpec?: animation;
  resizeMode?: ContentMode;
  scale?: SymbolScale;
  modifiers?: ViewModifier[];
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color,
  colorToken,
  fontWeight = 'regular',
  useSwiftUI = false,
  container = false,
  accessibilityLabel: a11yLabel,
  symbolType,
  symbolColorTokens,
  animationSpec,
  resizeMode = 'scaleAspectFit',
  scale,
  modifiers: externalModifiers,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize = typeof size === 'number' ? size : ds.iconSize[size];

  const resolvedTintColor =
    color ?? (colorToken ? theme[colorToken] : theme.text);

  if (!useSwiftUI) {
    const resolvedType: SymbolType = symbolType ?? 'monochrome';
    const resolvedPaletteColors = symbolColorTokens
      ? symbolColorTokens.map((t) => theme[t])
      : undefined;

    return (
      <SymbolView
        name={name}
        size={resolvedSize}
        type={resolvedType}
        scale={scale}
        weight={fontWeight as SwiftUIFontWeight}
        colors={
          resolvedType === 'palette' || resolvedType === 'multicolor'
            ? resolvedPaletteColors
            : undefined
        }
        tintColor={
          resolvedType === 'palette' || resolvedType === 'multicolor'
            ? undefined
            : (resolvedTintColor ?? undefined)
        }
        resizeMode={resizeMode}
        animationSpec={animationSpec}
      />
    );
  }

  const a11yModifier = a11yLabel ? [accessibilityLabel(a11yLabel)] : [];
  const tile = 28;

  if (container && useSwiftUI) {
    return (
      <Image
        systemName={name}
        modifiers={[
          font({size: resolvedSize, weight: fontWeight}),
          foregroundStyle(Palette.white),
          frame({width: tile, height: tile}),
          background(resolvedTintColor ?? theme.card),
          cornerRadius(ds.borderRadius.lg),
          ...a11yModifier,
        ]}
      />
    );
  }

  return (
    <Image
      systemName={name}
      modifiers={[
        font({size: resolvedSize, weight: fontWeight}),
        foregroundStyle(resolvedTintColor ?? theme.icon),
        ...a11yModifier,
        ...(externalModifiers ?? []),
      ]}
    />
  );
};

export const AppIcons = {
  ui: {
    more: 'ellipsis',
    filter: 'line.3.horizontal.decrease',
    search: 'magnifyingglass',
    chevronUpDown: 'chevron.up.chevron.down',
    notifications: 'bell',
    settings: 'gear',
    appearance: 'circle.lefthalf.filled',
    biometric: 'faceid',
    haptic: 'hand.tap',
    language: 'globe.europe.africa',
    privacy: 'lock.circle',
    terms: 'doc.circle',
    plan: 'creditcard.circle.fill',
    info: 'info.circle',
    help: 'questionmark.circle',
    time: 'clock',
    profile: 'person.crop.circle',
    userManagement: 'person.2.circle',
    support: 'questionmark.circle',
    preference: 'slider.horizontal.2.gobackward',
    email: 'envelope',
    phone: 'phone',
    web: 'safari',
    tax: 'building.columns',
  },

  actions: {
    close: 'xmark',
    forward: 'chevron.right',
    back: 'chevron.left',
    add: 'plus',
    save: 'checkmark',
    share: 'square.and.arrow.up',
    delete: 'trash',
    refresh: 'arrow.clockwise',
    logout: 'arrow.right.circle.fill',
    download: 'icloud.and.arrow.down',
    edit: 'square.and.pencil',
    addUser: 'person.badge.plus',
    addItem: 'plus.square.on.square',
    move: 'arrow.turn.down.right',
    scan: 'viewfinder',
    camera: 'camera',
    input: 'keyboard',
    select: 'checkmark.circle',
    enableTorch: 'flashlight.on.fill',
    disableTorch: 'flashlight.off.fill',
  },

  domain: {
    item: 'rectangle.3.offgrid.fill',
    itemOutline: 'rectangle.3.group',
    vault: 'internaldrive.fill',
    vaultOutline: 'internaldrive',
    home: 'house.fill',
    homeOutline: 'house',
    settings: 'gear.circle',
    settingsOutline: 'gear',
    category: 'square.grid.2x2',
    location: 'location',
    supplier: 'cart',
    organization: 'briefcase.circle',
    maintenance: 'wrench',
  },

  files: {
    document: 'doc',
    folder: 'folder',
    file: 'doc.plaintext',
    image: 'photo',
    archive: 'archivebox',
    print: 'printer.inverse',
    list: 'list.bullet',
    others: 'questionmark.folder',
    pdf: 'doc.plaintext.fill',
    word: 'doc.plaintext.fill',
    excel: 'doc.plaintext.fill',
    text: 'doc.plaintext.fill',
  },

  status: {
    success: 'checkmark.circle',
    warning: 'exclamationmark.triangle',
    error: 'exclamationmark.circle',
    pending: 'clock',
  },

  emptyStates: {
    user: 'rectangle.stack.badge.person.crop',
    file: 'folder.badge.questionmark',
  },
} as const satisfies Record<string, Record<string, IconName>>;

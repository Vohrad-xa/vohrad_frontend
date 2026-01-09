import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {SymbolView, type SFSymbol, type SymbolViewProps} from 'expo-symbols';
import {Palette} from '@/constants';
import type {TokenName} from '@/constants/colors';
import {useTheme} from '@/providers/theme-provider';
import {
  accessibilityLabel,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
  Image,
  glassEffect,
} from 'sykamore-ui/ios';

export type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconName = SFSymbol;
type SymbolType = NonNullable<SymbolViewProps['type']>;
type SwiftUIFontWeight = NonNullable<Parameters<typeof font>[0]['weight']>;

export type IconProps = {
  name: IconName;
  size?: number | IconSizeKey;
  color?: string;
  colorToken?: TokenName;
  fontWeight?: SwiftUIFontWeight;
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
  withBackground?: boolean;
  useSwiftUI?: boolean;
  container?: boolean;
  symbolType?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  symbolColorTokens?: TokenName[];
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 15,
  color,
  colorToken,
  fontWeight = 'regular',
  useSwiftUI = false,
  container = false,
  accessibilityLabel: a11yLabel,
  symbolType,
  symbolColorTokens,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.sm);
  const sizeNoContainer = typeof size === 'number' ? size : ds.iconSize.sm;
  const frameSize = resolvedSize * 1.8;

  const resolvedTintColor =
    color ?? (colorToken ? theme[colorToken] : theme.text);

  const resolvedIconColor = Palette.white;

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
        colors={
          resolvedType === 'palette' || resolvedType === 'multicolor'
            ? resolvedPaletteColors
            : undefined
        }
        tintColor={
          resolvedType === 'palette' || resolvedType === 'multicolor'
            ? undefined
            : (resolvedTintColor ?? theme.icon)
        }
      />
    );
  }

  const a11yModifier = a11yLabel ? [accessibilityLabel(a11yLabel)] : [];

  if (container && useSwiftUI) {
    return (
      <Image
        systemName={name}
        modifiers={[
          font({size: resolvedSize, weight: fontWeight}),
          foregroundStyle(resolvedIconColor),
          frame({width: frameSize, height: frameSize}),
          background(resolvedTintColor ?? theme.card),
          clipShape('roundedRectangle'),
          glassEffect({
            glass: {
              variant: 'clear',
            },
            shape: 'roundedRectangle',
            cornerRadius: ds.borderRadius.lg,
          }),
          ...a11yModifier,
        ]}
      />
    );
  }

  return (
    <Image
      systemName={name}
      modifiers={[
        font({size: sizeNoContainer, weight: fontWeight}),
        foregroundStyle(resolvedTintColor ?? theme.icon),
        ...a11yModifier,
      ]}
    />
  );
};

export const AppIcons = {
  ui: {
    close: 'xmark',
    back: 'chevron.left.2',
    more: 'ellipsis',
    menu: 'line.3.horizontal.decrease',
    chevronRight: 'chevron.right',
    chevronLeft: 'chevron.left',
    filter: 'equal',
    chevronUpDown: 'chevron.up.chevron.down',
  },

  tabs: {
    home: 'house.fill',
    vault: 'tray.full.fill',
    settings: 'gear',
    profile: 'person.crop.circle.fill',
    item: 'square.grid.2x2.fill',
    notifications: 'bell',
  },

  actions: {
    add: 'plus',
    addUser: 'person.badge.plus',
    addItem: 'plus.square.on.square',
    edit: 'square.and.pencil',
    delete: 'trash',
    save: 'checkmark',
    close: 'xmark',
    share: 'square.and.arrow.up',
    refresh: 'arrow.clockwise',
    move: 'arrow.turn.down.right',
    download: 'icloud.and.arrow.down',
    scan: 'viewfinder',
    camera: 'camera',
    input: 'keyboard',
    select: 'checkmark.circle',
    logout: 'arrow.right.circle.fill',
    enableTorch: 'flashlight.on.fill',
    disableTorch: 'flashlight.off.fill',
  },

  features: {
    item: 'rectangle.stack',
    category: 'square.grid.2x2',
    location: 'location',
    search: 'magnifyingglass',
    supplier: 'cart',
    organization: 'briefcase.circle.fill',
    maintenance: 'wrench',
    support: 'questionmark.circle',
    userManagement: 'person.2.circle.fill',
  },

  files: {
    document: 'doc',
    folder: 'folder',
    file: 'doc.plaintext',
    image: 'photo',
    imageFallback: 'photo.badge.exclamationmark',
    archive: 'doc.zipper',
    print: 'printer.inverse',
    list: 'list.bullet',
    others: 'questionmark.folder',
    pdf: 'doc.plaintext.fill',
    word: 'doc.plaintext.fill',
    excel: 'doc.plaintext.fill',
    ppt: 'doc.plaintext.fill',
    text: 'doc.plaintext.fill',
  },

  status: {
    success: 'checkmark.circle',
    warning: 'exclamationmark.triangle',
    error: 'exclamationmark.circle',
    info: 'info.circle.fill',
    help: 'questionmark.circle.fill',
    time: 'clock',
  },

  preferences: {
    settings: 'slider.horizontal.2.square',
    appearance: 'circle.lefthalf.filled',
    biometric: 'faceid',
    haptic: 'hand.tap.fill',
    language: 'globe.europe.africa.fill',
    privacy: 'hand.raised.fill',
    terms: 'doc.text.fill',
    plan: 'creditcard.circle.fill',
  },
} as const satisfies Record<string, Record<string, IconName>>;

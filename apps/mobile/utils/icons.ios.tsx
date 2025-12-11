import React from 'react';
import {SymbolView, type SFSymbol} from 'expo-symbols';
import {Palette, type TokenName} from '@/constants';
import {frame, glassEffect, Image} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers/theme-provider';

export type IconName = string;

type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface IconProps {
  name: IconName;
  size?: number | IconSizeKey;
  tintColor?: string;
  tintToken?: TokenName;
  colorToken?: TokenName;
  color?: string;
  interactive?: boolean;
  iconColor?: string;
  useSwiftUI?: boolean;
  noContainer?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 15,
  tintColor,
  tintToken,
  colorToken,
  color,
  iconColor,
  useSwiftUI = false,
  noContainer = false,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.sm);
  const sizeNoContainer = typeof size === 'number' ? size : ds.iconSize.sm;
  const frameSize = resolvedSize * 2;
  const resolvedTintToken = tintToken ?? colorToken;
  const resolvedTintColor =
    tintColor ??
    color ??
    (resolvedTintToken ? theme[resolvedTintToken] : undefined);
  const resolvedIconColor = iconColor ?? Palette.white;

  if (!useSwiftUI) {
    return (
      <SymbolView
        name={name as SFSymbol}
        size={resolvedSize}
        tintColor={resolvedTintColor ?? theme.muted}
      />
    );
  }

  if (noContainer) {
    return (
      <Image
        systemName={name as SFSymbol}
        color={resolvedTintColor ?? theme.muted}
        size={sizeNoContainer}
      />
    );
  }

  return (
    <Image
      systemName={name as SFSymbol}
      color={resolvedIconColor}
      size={resolvedSize}
      modifiers={[
        frame({width: frameSize, height: frameSize}),
        glassEffect({
          glass: {
            variant: 'regular',
            tint: resolvedTintColor ?? theme.card,
          },
          shape: 'roundedRectangle',
          cornerRadius: ds.borderRadius.xl,
        }),
      ]}
    />
  );
};

export const IconPresets = {
  small: {size: 'sm' as IconSizeKey},
  medium: {size: 'md' as IconSizeKey},
  large: {size: 'lg' as IconSizeKey},
  xlarge: {size: 'xxl' as IconSizeKey},
} as const;

export const AppIcons = {
  navigation: {
    home: 'house' as IconName,
    homeFill: 'house.fill' as IconName,
    menu: 'line.3.horizontal.decrease' as IconName,
    settings: 'gear' as IconName,
    scan: 'barcode.viewfinder' as IconName,
    profile: 'person' as IconName,
    vault: 'folder' as IconName,
    event: 'bell' as IconName,
    eventFill: 'bell.fill' as IconName,
    filter: 'equal' as IconName,
    back: 'chevron.left.2' as IconName,
    forward: 'chevron.right' as IconName,
    close: 'xmark' as IconName,
    chevronRight: 'chevron.right' as IconName,
    more: 'ellipsis' as IconName,
    preferences: 'slider.horizontal.3' as IconName,
  },

  inventory: {
    itemFill: 'rectangle.stack.fill' as IconName,
    item: 'rectangle.stack' as IconName,
    categoryFill: 'square.grid.2x2.fill' as IconName,
    category: 'square.grid.2x2' as IconName,
    locationFill: 'location.fill' as IconName,
    location: 'location' as IconName,
    search: 'magnifyingglass' as IconName,
  },

  actions: {
    scan: 'barcode.viewfinder' as IconName,
    camera: 'camera' as IconName,
    input: 'keyboard' as IconName,
    edit: 'square.and.pencil' as IconName,
    add: 'plus' as IconName,
    addUser: 'person.badge.plus' as IconName,
    addItem: 'plus.square.on.square' as IconName,
    save: 'checkmark.circle' as IconName,
    delete: 'trash' as IconName,
    share: 'square.and.arrow.up' as IconName,
    refresh: 'arrow.clockwise' as IconName,
    move: 'arrow.turn.down.right' as IconName,
    logout: 'arrow.right.circle.fill' as IconName,
    close: 'xmark' as IconName,
  },

  content: {
    documentFill: 'doc.text.fill' as IconName,
    document: 'doc.text' as IconName,
    folder: 'folder' as IconName,
    file: 'doc' as IconName,
    image: 'photo' as IconName,
    archive: 'archivebox' as IconName,
    imageFallback: 'photo' as IconName,
    download: 'arrow.down.circle' as IconName,
    export: 'square.and.arrow.up' as IconName,
    printFill: 'printer.fill' as IconName,
    print: 'printer' as IconName,
    language: 'globe' as IconName,
    privacy: 'hand.raised.fill' as IconName,
    search: 'magnifyingglass' as IconName,
    list: 'list.bullet' as IconName,
    terms: 'doc.text.fill' as IconName,
  },

  status: {
    success: 'checkmark.circle' as IconName,
    warning: 'exclamationmark.triangle' as IconName,
    error: 'exclamationmark.circle' as IconName,
    info: 'info.circle.fill' as IconName,
    help: 'questionmark.circle.fill' as IconName,
    time: 'clock' as IconName,
    checkmarkCircleOutline: 'checkmark.circle' as IconName,
  },

  business: {
    supplierFill: 'cart.fill' as IconName,
    supplier: 'cart' as IconName,
    profile: 'person.fill' as IconName,
    plan: 'creditcard.fill' as IconName,
    organization: 'briefcase.fill' as IconName,
    equipment: 'cpu' as IconName,
    maintenance: 'wrench' as IconName,
    maintenanceFill: 'wrench.fill' as IconName,
    reports: 'chart.bar' as IconName,
  },

  theme: {
    appearance: 'circle.lefthalf.filled' as IconName,
    light: 'sun.max' as IconName,
    dark: 'moon' as IconName,
  },

  settings: {
    biometric: 'touchid' as IconName,
    haptic: 'iphone.radiowaves.left.and.right' as IconName,
  },
} as const;

export default Icon;

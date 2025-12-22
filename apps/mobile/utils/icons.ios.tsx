import React from 'react';
import {SymbolView, type SFSymbol} from 'expo-symbols';
import {Palette, type TokenName} from '@/constants';
import {
  accessibilityLabel,
  background,
  clipShape,
  font,
  foregroundStyle,
  frame,
  Image,
} from '@/modules/sykamore-ui/src/ios';
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
  accessibilityLabel?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 14,
  tintColor,
  tintToken,
  colorToken,
  color,
  iconColor,
  useSwiftUI = false,
  noContainer = false,
  accessibilityLabel: a11yLabel,
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
  const resolvedIconColor = iconColor ?? Palette.brand.white;

  if (!useSwiftUI) {
    return (
      <SymbolView
        name={name as SFSymbol}
        size={resolvedSize}
        tintColor={resolvedTintColor ?? theme.muted}
      />
    );
  }

  const a11yModifier = a11yLabel ? [accessibilityLabel(a11yLabel)] : [];

  if (noContainer) {
    return (
      <Image
        systemName={name as SFSymbol}
        modifiers={[
          font({size: sizeNoContainer}),
          foregroundStyle(resolvedTintColor ?? theme.muted),
          ...a11yModifier,
        ]}
      />
    );
  }

  return (
    <Image
      systemName={name as SFSymbol}
      modifiers={[
        font({size: resolvedSize}),
        foregroundStyle(resolvedIconColor),
        frame({width: frameSize, height: frameSize}),
        background(resolvedTintColor ?? theme.card),
        clipShape('roundedRectangle'),
        ...a11yModifier,
      ]}
    />
  );
};

export const AppIcons = {
  navigation: {
    home: 'house' as IconName,
    homeFill: 'house.fill' as IconName,
    menu: 'line.3.horizontal.decrease' as IconName,
    settings: 'gear' as IconName,
    scan: 'barcode.viewfinder' as IconName,
    profile: 'person.crop.circle.fill' as IconName,
    vault: 'folder' as IconName,
    event: 'bell' as IconName,
    eventFill: 'bell.fill' as IconName,
    filter: 'equal' as IconName,
    back: 'chevron.left.2' as IconName,
    forward: 'chevron.right' as IconName,
    close: 'xmark' as IconName,
    chevronRight: 'chevron.right' as IconName,
    more: 'ellipsis' as IconName,
    preferences: 'slider.horizontal.below.square.filled.and.square' as IconName,
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
    scan: 'viewfinder' as IconName,
    camera: 'camera' as IconName,
    input: 'keyboard' as IconName,
    edit: 'square.and.pencil' as IconName,
    add: 'plus' as IconName,
    addUser: 'person.badge.plus' as IconName,
    addItem: 'plus.square.on.square' as IconName,
    save: 'checkmark' as IconName,
    delete: 'trash' as IconName,
    share: 'square.and.arrow.up' as IconName,
    refresh: 'arrow.clockwise' as IconName,
    move: 'arrow.turn.down.right' as IconName,
    logout: 'arrow.right.circle.fill' as IconName,
    close: 'xmark' as IconName,
    download: 'icloud.and.arrow.up' as IconName,
  },

  content: {
    documentFill: 'doc.text.fill' as IconName,
    document: 'doc.text' as IconName,
    file: 'doc' as IconName,
    image: 'photo' as IconName,
    archive: 'archivebox' as IconName,
    imageFallback: 'photo' as IconName,
    export: 'square.and.arrow.up' as IconName,
    printFill: 'printer.fill' as IconName,
    print: 'printer' as IconName,
    language: 'globe.fill' as IconName,
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
    plan: 'creditcard.fill' as IconName,
    organization: 'briefcase.fill' as IconName,
    equipment: 'cpu' as IconName,
    maintenance: 'wrench' as IconName,
    maintenanceFill: 'wrench.fill' as IconName,
    reports: 'chart.bar' as IconName,
  },

  theme: {
    appearance: 'circle.lefthalf.filled' as IconName,
  },

  settings: {
    biometric: 'faceid' as IconName,
    haptic: 'hand.tap.fill' as IconName,
  },
} as const;

export default Icon;

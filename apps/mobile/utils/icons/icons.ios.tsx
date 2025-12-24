import React from 'react';
import {SymbolView, type SFSymbol, type SymbolViewProps} from 'expo-symbols';
import {Palette} from '@/constants';
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
import type {IconProps} from './icon-types';

type SymbolType = NonNullable<SymbolViewProps['type']>;

/**
 * iOS icon component using SF Symbols.
 * Use `AppIcons` constants for cross-platform consistency.
 *
 * @example
 * <Icon name={AppIcons.tabs.home} colorToken="primary" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 14,
  color,
  colorToken,
  useSwiftUI = false,
  noContainer = false,
  accessibilityLabel: a11yLabel,
  symbolType,
  symbolColorTokens,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.sm);
  const sizeNoContainer = typeof size === 'number' ? size : ds.iconSize.sm;
  const frameSize = resolvedSize * 2;
  const resolvedTintColor =
    color ?? (colorToken ? theme[colorToken] : undefined);
  const resolvedIconColor = Palette.brand.white;

  /**
   * SymbolView path - Use for standard React Native components.
   * Supports palette/multicolor rendering with multiple theme colors.
   */
  if (!useSwiftUI) {
    const resolvedType: SymbolType = symbolType ?? 'monochrome';
    const resolvedPaletteColors = symbolColorTokens
      ? symbolColorTokens.map((t) => theme[t])
      : undefined;

    return (
      <SymbolView
        name={name as SFSymbol}
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

  /**
   * SwiftUI Image path - Use ONLY for native bridged modules.
   * Required when integrating with SwiftUI components via native modules.
   */
  const a11yModifier = a11yLabel ? [accessibilityLabel(a11yLabel)] : [];

  if (noContainer) {
    return (
      <Image
        systemName={name as SFSymbol}
        modifiers={[
          font({size: sizeNoContainer}),
          foregroundStyle(resolvedTintColor ?? theme.icon),
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

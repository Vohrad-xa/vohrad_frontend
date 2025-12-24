import React from 'react';
import {View} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useTheme} from '@/providers/theme-provider';
import type {IconProps} from './icon-types';

/** Font family used for Material Community Icons glyphs */
export const IconFontFamily = 'MaterialCommunityIcons' as const;

/**
 * Get the raw glyph character for a Material Community Icons icon name.
 * Useful for custom text rendering with icon fonts.
 * @param name - Material Community Icons icon name
 * @returns Unicode glyph character or undefined if not found
 */
export function getIconGlyph(name: string): string | undefined {
  const glyph =
    MaterialCommunityIcons.glyphMap[
      name as keyof typeof MaterialCommunityIcons.glyphMap
    ];
  if (glyph == null) return undefined;
  return typeof glyph === 'number' ? String.fromCodePoint(glyph) : glyph;
}

/**
 * Icon component for Android using Material Community Icons.
 * Use `AppIcons` constants for consistent cross-platform icons.
 *
 * @example
 * <Icon name={AppIcons.tabs.home} size="lg" colorToken="primary" />
 * <Icon name="check-circle" size={24} withBackground />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'xl',
  color,
  colorToken,
  style,
  withBackground,
}) => {
  const {theme, ds} = useTheme();

  const resolvedSize =
    typeof size === 'number' ? size : (ds.iconSize[size] ?? ds.iconSize.md);

  const foreground = color ?? (colorToken ? theme[colorToken] : theme.icon);

  const iconColor = withBackground ? '#FFFFFF' : foreground;

  const iconElement = (
    <MaterialCommunityIcons
      name={name as keyof typeof MaterialCommunityIcons.glyphMap}
      size={resolvedSize}
      color={iconColor}
      style={style}
    />
  );

  if (withBackground) {
    const containerSize = resolvedSize * 2;
    return (
      <View
        style={{
          width: containerSize / 1.4,
          height: containerSize / 1.4,
          borderRadius: containerSize / 2,
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

import type { TextStyle } from 'react-native';

import { Tokens, type TokenName } from '@/constants/colors';
import { DesignSystem, type Typography } from '@/constants/typography';
import { useTheme } from '@/providers/theme-provider';

type Options = {
  color?: TokenName;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
};

const defaultColorTokenByVariant: Partial<Record<Typography, TokenName>> = {
  body: 'text',
  secondary: 'muted',
  tertiary: 'muted',
  caption: 'muted',
  actionBar: 'muted',
  interactive: 'text',
  largeTitle: 'text',
  pageTitle: 'text',
  pageTitleScrolled: 'text',
  title1: 'text',
  title2: 'text',
  title3: 'text',
  headline: 'text',
  callout: 'text',
  subheadline: 'muted',
  footnote: 'muted',
  caption1: 'muted',
  caption2: 'muted',
  tabBar: 'muted',
};

export function useTypography() {
  const { scheme } = useTheme();

  function style(variant: Typography, opts: Options = {}): TextStyle {
    const base = DesignSystem.typography[variant];
    const colorToken = opts.color ?? defaultColorTokenByVariant[variant] ?? 'text';
    return {
      ...base,
      color: Tokens[scheme][colorToken],
      fontWeight: opts.weight ?? base.fontWeight,
      textAlign: opts.align,
    } as TextStyle;
  }

  return { style };
}


/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Tokens, type TokenName } from '@/constants/colors';
import { useTheme } from '@/providers/theme-provider';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: TokenName,
) {
  const { scheme } = useTheme();
  const colorFromProps = props[scheme];

  if (colorFromProps) return colorFromProps;
  return Tokens[scheme][colorName];
}

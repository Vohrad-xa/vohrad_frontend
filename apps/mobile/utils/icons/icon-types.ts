import type {StyleProp, TextStyle} from 'react-native';
import type {TokenName} from '@/constants/colors';

/** Preset icon sizes mapped to design system tokens */
export type IconSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** Icon component props */
export interface IconProps {
  /** Icon name - prefer using AppIcons.category.name for consistency */
  name: string;
  /** Size in pixels or design system token */
  size?: number | IconSizeKey;
  /** Direct color value (hex string) */
  color?: string;
  /** Theme color token for icon tint */
  colorToken?: TokenName;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Custom style */
  style?: StyleProp<TextStyle>;
  /** Render icon with circular background */
  withBackground?: boolean;
  /** Use SwiftUI Image instead of SymbolView */
  useSwiftUI?: boolean;
  /** Render without background container */
  noContainer?: boolean;
  /** SF Symbol rendering mode */
  symbolType?: 'monochrome' | 'hierarchical' | 'palette' | 'multicolor';
  /** Array of theme tokens for palette/multicolor symbols */
  symbolColorTokens?: TokenName[];
}

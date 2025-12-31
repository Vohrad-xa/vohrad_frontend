import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle, TextStyle} from 'react-native';
import type {TokenName} from '@/constants/colors';
import type {IconName} from '@/utils/icons';

// all components
export interface BaseComponentProps {
  children?: ReactNode;
  testID?: string;
}

// view-based components
export interface BaseViewProps extends BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Text-based components
export interface BaseTextProps extends BaseComponentProps {
  style?: StyleProp<TextStyle>;
}

// multiple style surfaces
export interface ContainerStyleProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

// Icon sizes
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Props for components that optionally include an icon
export interface IconProps {
  icon?: IconName;
  iconSize?: IconSize;
  iconColor?: string;
  iconColorToken?: TokenName;
}

// Props for components that require an icon
export interface RequiredIconProps extends Omit<IconProps, 'icon'> {
  icon: IconName;
}

// Props for interactive components
export interface InteractiveProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Action variants for buttons and interactive elements
export type ActionVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'ghost';

// Action props for buttons and interactive elements
export interface ActionProps extends InteractiveProps {
  variant?: ActionVariant;
  isDestructive?: boolean;
}

// components with text labels
export interface LabeledComponentProps {
  label: string;
  subtitle?: string;
  description?: string;
}

// Tab navigation item
export interface TabItem {
  name: string;
  label: string;
  icon: IconName;
}

// menu card with count display
export interface MenuCard {
  title: string;
  icon: IconName;
  count: number;
  colorToken: TokenName;
}

// Menu item with icon and label
export interface MenuItem extends RequiredIconProps {
  label: string;
}

// Interactive menu item with actions
export interface MenuItemProps extends MenuItem, ActionProps {}

// list item with label, icon, and actions
export interface ListItemBaseProps
  extends BaseViewProps, LabeledComponentProps, IconProps, ActionProps {}

// Button base props
export interface ButtonBaseProps extends BaseViewProps, ActionProps {}

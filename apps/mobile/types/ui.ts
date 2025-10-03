import type {ViewStyle, TextStyle} from 'react-native';
import type {TokenName} from '@/constants/colors';
import type {IconName} from '@/utils';
import type {PlatformStyles} from './platform';

export interface TabItem {
  name: string;
  label: string;
  icon: IconName;
}

export interface MenuCard {
  title: string;
  icon: IconName;
  count: number;
  colorToken: TokenName;
}

export interface MenuItem {
  icon: IconName;
  label: string;
}

export interface MenuItemProps extends MenuItem {
  onPress: () => void;
  isDestructive?: boolean;
}

export interface StandardTabContainerStyle extends ViewStyle {
  flex: 1;
  padding: 16;
}

export type TabBackgroundStyle = PlatformStyles<
  {backgroundColor: string},
  {backgroundColor: string}
>;

export const STANDARD_TAB_CONTAINER: StandardTabContainerStyle = {
  flex: 1,
  padding: 16,
};

export const STANDARD_CONTENT_SPACING: Pick<TextStyle, 'marginTop'> = {
  marginTop: 16,
};

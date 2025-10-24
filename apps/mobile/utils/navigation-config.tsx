import {Platform} from 'react-native';
import {HeaderButton} from '@/components/ui';
import {type ThemeShape} from '@/constants/theme';
import {AppIcons} from '@/utils';

export function getTabStackOptions(
  theme: ThemeShape,
  toggleSideMenu: () => void,
) {
  return {
    headerShown: true,
    headerTransparent: Platform.OS === 'ios',
    headerStyle:
      Platform.OS === 'android'
        ? {backgroundColor: theme.navigationBar}
        : undefined,
    headerTitleStyle: {color: theme.text},
    headerTitleAlign: 'center' as const,
    headerLeft: () => (
      <HeaderButton
        icon={AppIcons.navigation.menu}
        accessibilityLabel="Open menu"
        onPress={toggleSideMenu}
        iconSize="xxl"
      />
    ),
    contentStyle: {
      backgroundColor: theme.background,
    },
  } as const;
}

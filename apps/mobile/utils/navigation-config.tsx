import {type ThemeShape} from '@/constants/theme';

export function getTabStackOptions(
  theme: ThemeShape,
  _toggleSideMenu: () => void,
) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerStyle: {
      backgroundColor: theme.navigationBar,
    },
    headerTitleStyle: {color: theme.text},
    headerTitleAlign: 'center' as const,
    contentStyle: {
      backgroundColor: theme.background,
    },
  } as const;
}

import {Platform} from 'react-native';
import {NavigationGradient} from '@/components/navigation';
import {type ThemeShape} from '@/constants/theme';

export function getTabStackOptions(
  theme: ThemeShape,
  _toggleSideMenu: () => void,
  scheme: 'light' | 'dark',
) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerBackground:
      Platform.OS === 'android'
        ? () => <NavigationGradient scheme={scheme} />
        : undefined,
    headerStyle: {
      backgroundColor:
        Platform.OS === 'android' ? undefined : theme.navigationBar,
    },
    headerTitleStyle: {color: theme.text},
    headerTitleAlign: 'center' as const,
    contentStyle: {
      backgroundColor: theme.background,
    },
  } as const;
}

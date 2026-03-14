import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {type SearchBarProps} from 'react-native-screens';
import {type ThemeShape} from '@/constants';

function titleStyle(
  theme: ThemeShape,
  androidFontSize: number,
): NonNullable<NativeStackNavigationOptions['headerTitleStyle']> {
  return {
    color: Platform.OS === 'android' ? theme.headerAndroid : undefined,
    fontSize: Platform.OS === 'ios' ? 18 : androidFontSize,
  };
}

export type SearchChangeEvent = Parameters<
  NonNullable<SearchBarProps['onChangeText']>
>[0];

export function sectionTitleStyle(
  theme: ThemeShape,
): NonNullable<NativeStackNavigationOptions['headerTitleStyle']> {
  return titleStyle(theme, 26);
}

export function baseStackOptions(
  theme: ThemeShape,
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    headerTransparent: Platform.OS === 'ios',
    headerTitleStyle: titleStyle(theme, 20),
  };
}

export function searchOptions(
  theme: ThemeShape,
  onChangeText: NonNullable<SearchBarProps['onChangeText']>,
  overrides: Omit<Partial<SearchBarProps>, 'onChangeText'> = {},
): SearchBarProps {
  return {
    placement: 'integratedButton',
    inputType: 'text',
    placeholder: 'Search',
    hideWhenScrolling: false,
    shouldShowHintSearchIcon: true,
    headerIconColor: theme.icon,
    hintTextColor: theme.icon,
    textColor: theme.text,
    onChangeText,
    ...overrides,
  };
}

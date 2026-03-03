import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack} from 'expo-router';
import {SearchProvider, useSearch, useTheme} from '@/providers';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function LocationsStack() {
  const {theme} = useTheme();
  const {setSearchQuery} = useSearch();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  const headerSearchBarOptions = useMemo(
    () =>
      ({
        placement: 'integratedButton',
        hideWhenScrolling: false,
        placeholder: 'Search',
        headerIconColor: theme.icon,
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          fontSize: Platform.OS !== 'ios' ? 26 : 18,
        },
      }) satisfies NativeStackNavigationOptions,
    [theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () =>
      ({
        headerTitle: 'Locations',
        headerSearchBarOptions,
      }) satisfies NativeStackNavigationOptions,
    [headerSearchBarOptions],
  );

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={indexOptions} />
    </Stack>
  );
}

export default function LocationsLayout() {
  return (
    <SearchProvider>
      <LocationsStack />
    </SearchProvider>
  );
}

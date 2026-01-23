import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack} from 'expo-router';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme} from '@/providers';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function VaultStack() {
  const {theme, ds} = useTheme();
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
        placement: 'inline' as const,
        hideWhenScrolling: false,
        inputType: 'text',
        headerIconColor: theme.icon,
        hintTextColor: theme.icon,
        placeholder: 'Search',
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          fontWeight: ds.fontWeight.bold,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
        headerLargeTitleStyle: {
          fontWeight: ds.fontWeight.bold,
        },
      }) satisfies NativeStackNavigationOptions,
    [ds.fontWeight.bold, theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () => ({
      headerTitle: 'Vault',
      headerSearchBarOptions: {
        ...headerSearchBarOptions,
        placement: 'stacked' as const,
      },
    }),
    [headerSearchBarOptions],
  );

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen name="add" options={{headerTitle: 'Add Attachment'}} />
      <Stack.Screen
        name="images"
        options={{headerTitle: 'Library', headerSearchBarOptions}}
      />
      <Stack.Screen
        name="documents"
        options={{
          headerTitle: 'Documents',
          headerSearchBarOptions,
        }}
      />
      <Stack.Screen
        name="archives"
        options={{headerTitle: 'Archives', headerSearchBarOptions}}
      />
      <Stack.Screen
        name="other"
        options={{headerTitle: 'Other Attachments', headerSearchBarOptions}}
      />
    </Stack>
  );
}

export default function VaultLayout() {
  return (
    <SearchProvider>
      <VaultStack />
    </SearchProvider>
  );
}

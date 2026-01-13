import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderButton} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function VaultStack() {
  const insets = useSafeAreaInsets();
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const {setSearchQuery} = useSearch();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  const headerLeftMenu = useCallback(
    () => (
      <HeaderButton
        variant="menu"
        accessibilityLabel="Open menu"
        onPress={toggleSideMenu}
      />
    ),
    [toggleSideMenu],
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
        animation: 'ios_from_right' as const,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleAlign: 'center' as const,
        headerTitleStyle: {
          fontWeight: ds.fontWeight.bold,
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
        contentStyle: {
          paddingBottom:
            Platform.OS === 'android'
              ? insets.bottom + ds.layout.tabBarHeight
              : 0,
        },
        headerLargeTitleStyle: {
          fontWeight: ds.fontWeight.bold,
        },
      }) satisfies NativeStackNavigationOptions,
    [
      ds.fontWeight.bold,
      theme.headerAndroid,
      ds.layout.tabBarHeight,
      insets.bottom,
    ],
  );

  const indexOptions = useMemo(
    () => ({
      headerTitle: 'Vault',
      headerLeft: headerLeftMenu,
      headerSearchBarOptions: {
        ...headerSearchBarOptions,
        placement: 'stacked' as const,
      },
    }),
    [headerLeftMenu, headerSearchBarOptions],
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

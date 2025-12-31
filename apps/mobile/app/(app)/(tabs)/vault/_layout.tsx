import React, {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
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
    () => ({
      placement: 'automatic' as const,
      hideWhenScrolling: true,
      placeholder: 'Search...',
      onChangeText: handleSearchChange,
    }),
    [handleSearchChange],
  );

  const stackScreenOptions = useMemo(
    () => ({
      headerShown: true,
      headerShadowVisible: false,
      headerLargeTitle: true,
      animation: 'ios_from_right' as const,
      headerBackButtonDisplayMode: 'minimal' as const,
      headerTransparent: Platform.OS === 'ios',
      headerTitleAlign: 'left' as const,
      headerTitleStyle: {
        fontSize:
          Platform.OS === 'android' ? ds.typography.title3.fontSize : undefined,
        fontWeight: ds.fontWeight.bold,
        color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
      },
      contentStyle: {
        paddingBottom:
          Platform.OS === 'android'
            ? insets.bottom + ds.layout.tabBarHeight
            : 0,
      },
    }),
    [
      ds.typography.title3.fontSize,
      ds.fontWeight.bold,
      theme.headerAndroid,
      ds.layout.tabBarHeight,
      insets.bottom,
    ],
  );

  const indexOptions = useMemo(
    () => ({
      headerTitle: 'Vault',
      headerTitleAlign: 'center' as const,
      headerLeft: headerLeftMenu,
      headerSearchBarOptions,
    }),
    [headerLeftMenu, headerSearchBarOptions],
  );

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen
        name="add"
        options={{headerTitle: 'Add Attachment', headerLargeTitle: false}}
      />
      <Stack.Screen name="images" options={{headerTitle: 'Library'}} />
      <Stack.Screen name="documents" options={{headerTitle: 'Documents'}} />
      <Stack.Screen name="archives" options={{headerTitle: 'Archives'}} />
      <Stack.Screen name="other" options={{headerTitle: 'Other Attachments'}} />
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

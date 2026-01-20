import {useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {Stack, useSegments} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {VAULT_SEARCH_SCOPES} from '@/features/attachments/utils';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function VaultStack() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const segments = useSegments();
  const activeSearchScope = useMemo(() => {
    const screen = segments.at(3);
    if (screen === 'images') return VAULT_SEARCH_SCOPES.images;
    if (screen === 'documents') return VAULT_SEARCH_SCOPES.documents;
    if (screen === 'archives') return VAULT_SEARCH_SCOPES.archives;
    if (screen === 'other') return VAULT_SEARCH_SCOPES.other;
    return VAULT_SEARCH_SCOPES.index;
  }, [segments]);
  const {setSearchQuery} = useSearch(activeSearchScope);

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
        textColor: theme.text,
        placeholder: 'Search',
        shouldShowHintSearchIcon: true,
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon, theme.text],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTintColor: theme.icon,
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
        },
      }) satisfies NativeStackNavigationOptions,
    [theme.headerAndroid, theme.icon],
  );

  const indexOptions = useMemo(
    () => ({
      headerTitle: 'Vault',
      headerTitleAlign: 'center' as const,
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

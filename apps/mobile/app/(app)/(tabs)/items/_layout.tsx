import type {ReactNode} from 'react';
import {useCallback, createContext, useContext, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

interface ItemChangesContextType {
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

const ItemChangesContext = createContext<ItemChangesContextType | null>(null);

export function useItemChanges() {
  const context = useContext(ItemChangesContext);
  if (!context) {
    return {
      hasChanges: false,
      setHasChanges: () => {},
    };
  }
  return context;
}

function ItemChangesProvider({children}: {children: ReactNode}) {
  const [hasChanges, setHasChanges] = useState(false);

  const value = useMemo(
    () => ({
      hasChanges,
      setHasChanges,
    }),
    [hasChanges],
  );

  return (
    <ItemChangesContext.Provider value={value}>
      {children}
    </ItemChangesContext.Provider>
  );
}

function ItemsStack() {
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
      placement: 'integratedButton' as const,
      hideWhenScrolling: false,
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
    }),
    [ds.typography.title3.fontSize, ds.fontWeight.bold, theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () => ({
      headerTitle: 'Items',
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
        name="[id]"
        options={{
          headerTitle: 'Item Details',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}

export default function ItemsLayout() {
  return (
    <SearchProvider>
      <ItemChangesProvider>
        <ItemsStack />
      </ItemChangesProvider>
    </SearchProvider>
  );
}

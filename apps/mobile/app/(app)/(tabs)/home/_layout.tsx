import type {ReactNode} from 'react';
import {useCallback, useMemo, createContext, useContext, useState} from 'react';
import type {NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';
import {View, Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/home/search-context';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

interface ItemChangesContextType {
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

const ItemChangesContext = createContext<ItemChangesContextType | null>(null);

export function useItemChanges() {
  const context = useContext(ItemChangesContext);
  if (!context) {
    // Return default values to avoid errors
    return {
      hasChanges: false,
      setHasChanges: () => {},
    };
  }
  return context;
}

function ItemChangesProvider({children}: {children: ReactNode}) {
  const [hasChanges, setHasChanges] = useState(false);

  const value = {
    hasChanges,
    setHasChanges,
  };

  return (
    <ItemChangesContext.Provider value={value}>
      {children}
    </ItemChangesContext.Provider>
  );
}

function DashboardStack() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const {setSearchQuery} = useSearch();
  const handleSearchChange = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setSearchQuery(event.nativeEvent.text);
    },
    [setSearchQuery],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerTransparent: Platform.OS === 'ios',
      headerStyle:
        Platform.OS === 'ios'
          ? undefined
          : {
              backgroundColor: theme.navigationBar,
            },
      headerTitleStyle: {color: theme.text},
      headerTitleAlign: 'center' as const,
      contentStyle: {
        backgroundColor: theme.background,
        flex: 1,
      },
    }),
    [theme],
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.background}}>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Home',
            headerLeft: () => (
              <HeaderButton
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
                iconSize="xxl"
              />
            ),
          }}
        />
        <Stack.Screen
          name="items/index"
          options={{
            headerTitle: 'Items',
            headerSearchBarOptions: {
              obscureBackground: true,
              placement: 'integrated',
              placeholder: 'Search...',
              onChangeText: handleSearchChange,
            },
          }}
        />
        <Stack.Screen
          name="items/[id]"
          options={{
            headerTitle: 'Item Details',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
      </Stack>
    </View>
  );
}

export default function DashboardLayout() {
  return (
    <SearchProvider>
      <ItemChangesProvider>
        <DashboardStack />
      </ItemChangesProvider>
    </SearchProvider>
  );
}

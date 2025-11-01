import type {ReactNode} from 'react';
import {useCallback, useMemo, createContext, useContext, useState} from 'react';
import type {NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';
import {View, Platform} from 'react-native';
import {Stack} from 'expo-router';
import {NavigationGradient} from '@/components/navigation';
import {HeaderButton} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/home/search-context';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

interface ItemChangesContextType {
  hasChanges: boolean;
  setHasChanges: (hasChanges: boolean) => void;
}

export const unstable_settings = {
  initialRouteName: 'index',
};

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
  const {theme, scheme} = useTheme();
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
      headerShadowVisible: false,
      headerBackground:
        Platform.OS !== 'ios'
          ? () => <NavigationGradient scheme={scheme} />
          : undefined,
      headerTitleStyle: {color: theme.text},
      headerTitleAlign: 'center' as const,
      contentStyle: {
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.background,
        flex: 1,
      },
    }),
    [theme, scheme],
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
            headerBackButtonDisplayMode: 'minimal',
            headerTitle: 'Items',
            headerSearchBarOptions: {
              headerIconColor: theme.text,
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

import type {ReactNode} from 'react';
import {useCallback, createContext, useContext, useState} from 'react';
import {Platform, View} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {SearchProvider, useSearch} from '@/features/home/search-context';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

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

function ItemsStack() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const {setSearchQuery} = useSearch();

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      const text = event.nativeEvent.text;
      setSearchQuery(text);
    },
    [setSearchQuery],
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.background}}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerStyle: {
            backgroundColor:
              Platform.OS === 'android' ? theme.navigationBar : undefined,
          },
          headerTitleStyle: {color: theme.text},
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerTitle: 'Items',
            headerLeft: () => (
              <HeaderButton
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
                iconSize="xxl"
              />
            ),
            headerSearchBarOptions: {
              headerIconColor: theme.text,
              placement: 'integrated',
              placeholder: 'Search...',
              onChangeText: handleSearchChange,
            },
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            headerTitle: 'Item Details',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
      </Stack>
    </View>
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

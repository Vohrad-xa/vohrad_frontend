import type {ReactNode} from 'react';
import {useCallback, createContext, useContext, useState} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

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
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const {setSearchQuery} = useSearch();
  const styles = createStyles(ds, theme);

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      const text = event.nativeEvent.text;
      setSearchQuery(text);
    },
    [setSearchQuery],
  );

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerStyle: {
            backgroundColor:
              Platform.OS === 'android' ? theme.navigationBar : undefined,
          },
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor:
              Platform.OS === 'web' ? theme.webbackground : theme.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerLargeTitle: true,
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
              placement: 'stacked',
              allowToolbarIntegration: false,
              hideWhenScrolling: false,
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

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.background,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default function ItemsLayout() {
  return (
    <SearchProvider>
      <ItemChangesProvider>
        <ItemsStack />
      </ItemChangesProvider>
    </SearchProvider>
  );
}

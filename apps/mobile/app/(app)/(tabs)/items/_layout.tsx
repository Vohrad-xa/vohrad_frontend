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
          headerShown: true,
          headerShadowVisible: false,
          headerLargeTitle: true,
          headerBackButtonMenuEnabled: true,
          headerTransparent: Platform.OS === 'ios',
          headerTitleAlign: 'left',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: styles.container,
          headerTitleStyle: {
            fontWeight: ds.fontWeight.bold,
            color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
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
                iconSize={Platform.OS === 'ios' ? 'xl' : 'xxl'}
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
                style={
                  Platform.OS === 'android'
                    ? {marginRight: ds.spacing.md}
                    : undefined
                }
              />
            ),
            headerSearchBarOptions: {
              placement: 'integratedButton',
              hideWhenScrolling: false,
              placeholder: 'Search...',
              onChangeText: handleSearchChange,
              headerIconColor:
                Platform.OS === 'android' ? theme.headerAndroid : undefined,
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
  (_ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
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

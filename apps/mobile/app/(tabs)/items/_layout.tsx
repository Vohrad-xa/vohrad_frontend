import {
  type ReactNode,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
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
  const {theme} = useTheme();
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
        placement: 'integratedButton' as const,
        hideWhenScrolling: false,
        placeholder: 'Search...',
        headerIconColor: theme.icon,
        onChangeText: handleSearchChange,
      }) satisfies NativeStackNavigationOptions['headerSearchBarOptions'],
    [handleSearchChange, theme.icon],
  );

  const stackScreenOptions = useMemo(
    () =>
      ({
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerTransparent: Platform.OS === 'ios',
        headerTitleStyle: {
          color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          fontSize: Platform.OS !== 'ios' ? 26 : 18,
        },
      }) satisfies NativeStackNavigationOptions,
    [theme.headerAndroid],
  );

  const indexOptions = useMemo(
    () =>
      ({
        headerTitle: 'Items',
        headerSearchBarOptions,
      }) satisfies NativeStackNavigationOptions,
    [headerSearchBarOptions],
  );

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={indexOptions} />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Item Details',
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

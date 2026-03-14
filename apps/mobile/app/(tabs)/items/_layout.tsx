import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import {Stack} from 'expo-router';
import {SearchProvider, useSearch, useTheme} from '@/providers';
import {
  baseStackOptions,
  searchOptions,
  sectionTitleStyle,
  type SearchChangeEvent,
} from '@/utils/navigation';

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
  const onSearchChange = (event: SearchChangeEvent) => {
    setSearchQuery(event.nativeEvent.text);
  };
  const search = searchOptions(theme, onSearchChange);
  const screenOptions = baseStackOptions(theme);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Items',
          headerTitleStyle: sectionTitleStyle(theme),
          headerSearchBarOptions: search,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: 'Item Details',
        }}
      />
      <Stack.Screen
        name="add-item"
        options={{
          presentation: 'formSheet',
          headerTitle: 'New Item',
          headerSearchBarOptions: undefined,
          gestureEnabled: false,
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

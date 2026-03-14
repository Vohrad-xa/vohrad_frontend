import {Stack} from 'expo-router';
import {SearchProvider, useSearch, useTheme} from '@/providers';
import {
  baseStackOptions,
  searchOptions,
  sectionTitleStyle,
  type SearchChangeEvent,
} from '@/utils/navigation';

function LocationsStack() {
  const {theme} = useTheme();
  const {setSearchQuery} = useSearch();
  const onSearchChange = (event: SearchChangeEvent) => {
    setSearchQuery(event.nativeEvent.text);
  };
  const search = searchOptions(theme, onSearchChange);
  const screenOptions = baseStackOptions(theme);
  const titleSyle = sectionTitleStyle(theme);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Locations',
          headerTitleStyle: titleSyle,
          headerSearchBarOptions: search,
        }}
      />
    </Stack>
  );
}

export default function LocationsLayout() {
  return (
    <SearchProvider>
      <LocationsStack />
    </SearchProvider>
  );
}

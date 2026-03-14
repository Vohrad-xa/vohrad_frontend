import {Stack, useSegments} from 'expo-router';
import {VAULT_SEARCH_SCOPES} from '@/features/attachments/utils';
import {SearchProvider, useSearch, useTheme} from '@/providers';
import {
  baseStackOptions,
  searchOptions,
  sectionTitleStyle,
  type SearchChangeEvent,
} from '@/utils/navigation';

function VaultStack() {
  const {theme} = useTheme();
  const segments = useSegments();
  const segment = segments.at(2);
  const activeSearchScope =
    segment === 'images'
      ? VAULT_SEARCH_SCOPES.images
      : segment === 'documents'
        ? VAULT_SEARCH_SCOPES.documents
        : segment === 'archives'
          ? VAULT_SEARCH_SCOPES.archives
          : segment === 'other'
            ? VAULT_SEARCH_SCOPES.other
            : VAULT_SEARCH_SCOPES.index;
  const {setSearchQuery} = useSearch(activeSearchScope);

  const onSearchChange = (event: SearchChangeEvent) => {
    setSearchQuery(event.nativeEvent.text);
  };

  const search = searchOptions(theme, onSearchChange);
  const stackedSearch = searchOptions(theme, onSearchChange, {
    placement: 'stacked',
  });
  const screenOptions = baseStackOptions(theme);
  const titleStyle = sectionTitleStyle(theme);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Vault',
          headerTitleStyle: titleStyle,
          headerSearchBarOptions: stackedSearch,
        }}
      />
      <Stack.Screen name="add" options={{headerTitle: 'Add Attachment'}} />
      <Stack.Screen
        name="images"
        options={{headerTitle: 'Library', headerSearchBarOptions: search}}
      />
      <Stack.Screen
        name="documents"
        options={{
          headerTitle: 'Documents',
          headerSearchBarOptions: search,
        }}
      />
      <Stack.Screen
        name="archives"
        options={{headerTitle: 'Archives', headerSearchBarOptions: search}}
      />
      <Stack.Screen
        name="other"
        options={{
          headerTitle: 'Other Attachments',
          headerSearchBarOptions: search,
        }}
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

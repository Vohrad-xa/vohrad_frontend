import React, {useLayoutEffect} from 'react';
import {useItemsManager} from '@sykamore/store';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useSearch} from '@/features/dashboard';
import {
  ItemsList,
  useHybridItemSearch,
  useServerSearchState,
  useItemFilters,
} from '@/features/item';
import {AppIcons} from '@/utils';

export default function ItemsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {searchQuery: globalSearchQuery} = useSearch();
  const params = useLocalSearchParams<{filters?: string}>();

  // Manage server search state
  const {shouldUseServerSearch, enableServerSearch} =
    useServerSearchState(globalSearchQuery);

  // Manage filters
  const {filters, odataFilter} = useItemFilters({
    urlParams: params.filters,
    searchQuery: shouldUseServerSearch ? globalSearchQuery : undefined,
  });

  // Use items manager with OData filter
  const {
    items: rawItems,
    isLoading,
    error,
    refresh,
    getItemImageUrl,
    hasNext,
    onEndReached,
    isFetchingNextPage,
  } = useItemsManager({
    odataFilter,
  });

  // Hybrid search: local first, server fallback
  const items = useHybridItemSearch({
    items: rawItems,
    searchQuery: globalSearchQuery,
    onServerSearchNeeded: enableServerSearch,
    isUsingServerSearch: shouldUseServerSearch,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.ui.filter}
          accessibilityLabel="Filter items"
          onPress={() => {
            router.push(
              `/(modals)/items/filters?initialFilters=${encodeURIComponent(
                JSON.stringify(filters),
              )}`,
            );
          }}
        />
      ),
    });
  }, [navigation, filters, router]);

  const handleItemPress = (itemId: string) => {
    router.push({
      pathname: '/(tabs)/items/[id]',
      params: {id: itemId},
    });
  };

  const hasItems = items.length > 0;
  const isEmpty = !isLoading && !hasItems && !error;

  return (
    <ItemsList
      searchQuery={globalSearchQuery}
      onItemPress={handleItemPress}
      onRefresh={refresh}
      items={items}
      isLoading={isLoading}
      error={error?.message ?? null}
      hasItems={hasItems}
      isEmpty={isEmpty}
      getItemImageUrl={getItemImageUrl}
      onLoadMore={onEndReached}
      canLoadMore={hasNext}
      isLoadingMore={isFetchingNextPage}
    />
  );
}

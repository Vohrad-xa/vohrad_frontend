import React, {useLayoutEffect, useEffect, useRef, useState} from 'react';
import {usePendingFilters, useClearPendingFilters} from '@sykamore/store';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useSearch} from '@/features/dashboard';
import {useItemsSource} from '@/features/item/hooks';
import {
  ItemsFilterSheet,
  ItemsList,
  type ItemsFilterSheetHandle,
} from '@/features/item/views';
import type {ItemFilterState} from '@sykamore/types';

export default function ItemsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {searchQuery} = useSearch();
  const params = useLocalSearchParams<{filters?: string}>();

  const [filters, setFilters] = useState<ItemFilterState>({
    statuses: [],
    trackingModes: [],
    unitIds: [],
    priceMin: null,
    priceMax: null,
  });

  const filterSheetRef = useRef<ItemsFilterSheetHandle>(null);

  const pendingFilters = usePendingFilters();
  const clearPendingFilters = useClearPendingFilters();

  // Apply filters from URL params
  useEffect(() => {
    if (params.filters) {
      try {
        const parsed = JSON.parse(
          decodeURIComponent(params.filters),
        ) as ItemFilterState;
        setFilters(parsed);
      } catch (error) {
        console.error('Failed to parse filters from params:', error);
      }
    }
  }, [params.filters]);

  // Apply filters from modal
  useEffect(() => {
    if (pendingFilters) {
      setFilters(pendingFilters);
      clearPendingFilters();
    }
  }, [pendingFilters, clearPendingFilters]);

  const {
    items,
    isLoading,
    hasNext,
    loadMore,
    refresh,
    getItemImageUrl,
    lastUpdated,
  } = useItemsSource({
    searchQuery,
    filters,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          variant="more"
          accessibilityLabel="Filter items"
          onPress={() => {
            void filterSheetRef.current?.present();
          }}
        />
      ),
    });
  }, [navigation]);

  const handleItemPress = (itemId: string) => {
    router.push({
      pathname: '/(tabs)/items/[id]',
      params: {id: itemId},
    });
  };

  return (
    <>
      <ItemsList
        items={items}
        onItemPress={handleItemPress}
        onRefresh={refresh}
        onEndReached={hasNext ? loadMore : undefined}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        getItemImageUrl={getItemImageUrl}
      />
      <ItemsFilterSheet ref={filterSheetRef} initialFilters={filters} />
    </>
  );
}

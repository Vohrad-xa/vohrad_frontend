import React, {useLayoutEffect, useRef} from 'react';
import {useRouter, useNavigation} from 'expo-router';
import {useSearch} from '@/features/dashboard';
import {useItemsSource} from '@/features/item/hooks';
import {useItemFilters} from '@/features/item/hooks/use-item-filters';
import {
  ItemsFilterSheet,
  ItemsList,
  type ItemsFilterSheetHandle,
} from '@/features/item/views';
import {
  getHeaderOptions,
  type HeaderButtonAction,
} from '@/utils/navigation/header-actions';

export default function ItemsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {searchQuery} = useSearch();

  const {filters, setFilters, activeFilterCount} = useItemFilters();

  const filterSheetRef = useRef<ItemsFilterSheetHandle>(null);

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
    const filterAction: HeaderButtonAction = {
      type: 'button',
      key: 'filters',
      label: 'Filter items',
      iosSymbol: 'line.3.horizontal.decrease',
      icon: 'filter-variant',
      onPress: () => {
        void filterSheetRef.current?.present();
      },
      badge: activeFilterCount > 0 ? {value: activeFilterCount} : undefined,
      accessibilityLabel:
        activeFilterCount > 0
          ? `Filter items, ${activeFilterCount} active`
          : 'Filter items',
    };

    navigation.setOptions(getHeaderOptions({right: [filterAction]}));
  }, [navigation, activeFilterCount]);

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
      <ItemsFilterSheet
        ref={filterSheetRef}
        initialFilters={filters}
        onSave={setFilters}
      />
    </>
  );
}

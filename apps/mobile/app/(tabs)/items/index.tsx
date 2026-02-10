import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {useRouter, useNavigation} from 'expo-router';
import {
  useItemsSource,
  useItemFilters,
  AdvancedFilterSheet,
  ItemsFilterSheet,
  ItemsList,
  type AdvancedFilterSheetHandle,
  type ItemsFilterSheetHandle,
} from '@/features/item';
import {useSearch} from '@/providers';
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
  const advancedFilterSheetRef = useRef<AdvancedFilterSheetHandle>(null);

  const handleAdvancedFiltersPress = useCallback(() => {
    void advancedFilterSheetRef.current?.present();
  }, []);

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
        onAdvancedFiltersPress={handleAdvancedFiltersPress}
      />
      <AdvancedFilterSheet ref={advancedFilterSheetRef} />
    </>
  );
}

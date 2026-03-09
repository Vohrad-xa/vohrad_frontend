import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {useNavigation} from 'expo-router';
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
import {AppIcons} from '@/utils/icons';
import {
  useSafeRouter,
  getHeaderOptions,
  type HeaderButtonAction,
} from '@/utils/navigation';

export default function ItemsScreen() {
  const router = useSafeRouter();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
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
    enabled: isFocused,
  });

  useLayoutEffect(() => {
    const filterAction: HeaderButtonAction = {
      type: 'button',
      key: 'filters',
      label: 'Filter items',
      icon: AppIcons.ui.filter,
      iosSymbol: AppIcons.ui.filter,
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

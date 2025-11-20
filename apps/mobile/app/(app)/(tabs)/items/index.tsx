import React, {useLayoutEffect, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  usePendingFilters,
  useClearPendingFilters,
  useItemsManager,
} from '@vohrad/store';
import {type ItemFilterState} from '@vohrad/types';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useSearch} from '@/features/dashboard';
import {ItemsList} from '@/features/item';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export default function ItemsScreen() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {searchQuery: globalSearchQuery} = useSearch();

  // Read filters from URL params
  const params = useLocalSearchParams<{filters?: string}>();

  const {
    items,
    isLoading,
    error,
    refresh,
    getItemImageUrl,
    hasNext,
    onEndReached,
    isFetchingNextPage,
    filters,
    setFilters,
    setSearchQuery,
  } = useItemsManager();

  const pendingFilters = usePendingFilters();
  const clearPendingFilters = useClearPendingFilters();

  // Sync global search query with the item manager's state
  useEffect(() => {
    setSearchQuery(globalSearchQuery);
  }, [globalSearchQuery, setSearchQuery]);

  // Apply filters from URL params
  useEffect(() => {
    if (params.filters) {
      try {
        const parsedFilters = JSON.parse(
          decodeURIComponent(params.filters),
        ) as ItemFilterState;
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Failed to parse filters from params:', error);
      }
    }
  }, [params.filters, setFilters]);

  // Apply filters from modal when available
  useEffect(() => {
    if (pendingFilters) {
      setFilters(pendingFilters);
      clearPendingFilters();
    }
  }, [pendingFilters, setFilters, clearPendingFilters]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.navigation.filter}
          accessibilityLabel="Filter items"
          iconSize="xl"
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
      pathname: '/(app)/(tabs)/items/[id]',
      params: {id: itemId},
    });
  };

  const hasItems = items.length > 0;
  const isEmpty = !isLoading && !hasItems && !error;

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => `${themeKey(theme, ds)}`,
);

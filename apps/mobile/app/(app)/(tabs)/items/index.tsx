import React, {useCallback, useLayoutEffect, useEffect} from 'react';
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
import {useSearch} from '@/features/home/search-context';
import {ItemsList} from '@/features/item';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export default function ItemsScreen() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();

  // Read filters
  const params = useLocalSearchParams<{filters?: string}>();

  const {
    items,
    isLoading,
    error,
    hasItems,
    isEmpty,
    search,
    refresh,
    getItemImageUrl,
    canLoadMore,
    loadMore,
    isLoadingMore,
    filters,
    setFilters,
    selectItem,
  } = useItemsManager();
  const pendingFilters = usePendingFilters();
  const clearPendingFilters = useClearPendingFilters();

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

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Ignored
    }
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleItemPress = (itemId: string) => {
    selectItem(itemId);
    router.push({
      pathname: '/(app)/(tabs)/items/[id]',
      params: {id: itemId},
    });
  };

  return (
    <View style={styles.container}>
      <ItemsList
        searchQuery={searchQuery}
        onItemPress={handleItemPress}
        onRefresh={handleRefresh}
        items={items}
        isLoading={isLoading}
        error={error}
        hasItems={hasItems}
        isEmpty={isEmpty}
        search={search}
        getItemImageUrl={getItemImageUrl}
        onLoadMore={handleLoadMore}
        canLoadMore={canLoadMore}
        isLoadingMore={isLoadingMore}
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

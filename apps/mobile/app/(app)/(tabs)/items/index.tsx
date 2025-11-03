import React, {useCallback, useLayoutEffect, useEffect} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
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
import {usePullToRefresh} from '@/hooks';
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
    await refresh();
  }, [refresh]);

  const {refreshControl} = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleItemPress = (itemId: string) => {
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
        refreshControl={refreshControl}
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
  (_ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.secondbackground,
      },
    }),
  (ds, theme) => `${themeKey(theme, ds)}`,
);

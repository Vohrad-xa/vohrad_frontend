import React, {useCallback, useState, useLayoutEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useRouter, useNavigation} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSearch} from '@/features/home/search-context';
import {ItemsList, useItemsManager, FilterItemsModal} from '@/features/item';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemsScreen() {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.navigation.filter}
          accessibilityLabel="Filter items"
          iconSize="xl"
          onPress={() => setFilterModalVisible(true)}
        />
      ),
    });
  }, [navigation]);

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
  } = useItemsManager();

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
      pathname: '/(app)/(tabs)/home/items/[id]',
      params: {id: itemId},
    });
  };

  return (
    <>
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
      <FilterItemsModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </>
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

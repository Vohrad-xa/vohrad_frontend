import React, {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {ThemedView} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {ItemsList} from '@/features/item/list';
import {useItemsManager} from '@/features/item/list/use-items';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemsScreen() {
  const {ds} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds);
  const [searchQuery, setSearchQuery] = useState('');
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
    router.push(`/(app)/(tabs)/items/${itemId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Items',
          headerSearchBarOptions: {
            obscureBackground: true,
            placement: 'integrated',
            placeholder: 'Search...',
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
          },
        }}
      />
      <ThemedView style={styles.container}>
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
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds) => `${ds.version}`,
);

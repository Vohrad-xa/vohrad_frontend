import React, {useCallback, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  type RefreshControlProps,
} from 'react-native';
import {
  ThemedText,
  ModalFlatList,
  ListRow,
  Divider,
  EmptyState,
  type ListRowData,
} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import type {Item} from '@vohrad/store';

const SEARCH_DEBOUNCE_MS = 500;

type ItemsListProps = {
  searchQuery?: string;
  onItemPress: (itemId: string) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  items: Item[];
  isLoading: boolean;
  error: string | null;
  hasItems: boolean;
  isEmpty: boolean;
  search: (query: string) => void;
  getItemImageUrl: (item: Item) => {uri: string} | undefined;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
};

export function ItemsList({
  searchQuery,
  onItemPress,
  refreshControl,
  items,
  isLoading,
  error,
  hasItems,
  isEmpty,
  search,
  getItemImageUrl,
  onLoadMore,
  canLoadMore,
  isLoadingMore,
}: ItemsListProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(searchQuery ?? '');
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, search]);

  const transformItemToListRow = useCallback(
    (item: Item): ListRowData => ({
      id: item.id,
      name: item.name,
      code: item.code,
      image: getItemImageUrl(item),
      badge: item.is_active ? 'ACTIVE' : 'INACTIVE',
      badgeType: item.is_active ? 'active' : 'inactive',
      count: item.total_quantity,
      onPress: () => onItemPress(item.id),
    }),
    [onItemPress, getItemImageUrl],
  );

  const listData = useMemo(
    () => items.map(transformItemToListRow),
    [items, transformItemToListRow],
  );

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData; index: number}) => (
      <View>
        <ListRow item={item} showImage />
        {index < listData.length - 1 && (
          <View style={styles.dividerContainer}>
            <Divider />
          </View>
        )}
      </View>
    ),
    [listData.length, styles],
  );

  const listFooter = useMemo(() => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footerSpinner}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }, [isLoadingMore, styles, theme.tint]);

  const handleEndReached = useCallback(() => {
    if (!canLoadMore || !onLoadMore) {
      return;
    }
    onLoadMore();
  }, [canLoadMore, onLoadMore]);

  if (isLoading && !hasItems) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          message={
            searchQuery
              ? 'No items match your search.'
              : 'You have no items yet.'
          }
          icon="cube-outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModalFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={refreshControl}
        onEndReached={canLoadMore ? handleEndReached : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={listFooter}
      />
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: ds.spacing.xl,
      },
      dividerContainer: {
        paddingLeft: ds.spacing.xl + ds.spacing.xl + 8,
        paddingRight: ds.spacing.xs,
      },
      loadingText: {
        marginTop: ds.spacing.md,
        fontSize: ds.typography.body.fontSize,
      },
      errorText: {
        fontSize: ds.typography.body.fontSize,
        textAlign: 'center',
      },
      emptyText: {
        fontSize: ds.typography.body.fontSize,
        textAlign: 'center',
      },
      footerSpinner: {
        paddingVertical: ds.spacing.md,
        alignItems: 'center',
      },
      listContentWithHeader: {
        paddingTop: 0,
      },
    }),
  (ds) => `${ds.version}`,
);

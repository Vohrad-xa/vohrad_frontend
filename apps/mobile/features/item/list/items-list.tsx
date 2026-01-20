import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {
  ThemedText,
  ModalFlatList,
  ListRow,
  EmptyState,
  RefreshableScrollView,
  type ListRowData,
} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {Item} from '@sykamore/store';

type ItemsListProps = {
  searchQuery?: string;
  onItemPress: (itemId: string) => void;
  onRefresh?: () => void | Promise<void>;
  items: Item[];
  isLoading: boolean;
  error: string | null;
  hasItems: boolean;
  isEmpty: boolean;
  getItemImageUrl: (item: Item) => {uri: string} | undefined;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
};

export function ItemsList({
  searchQuery,
  onItemPress,
  onRefresh,
  items,
  isEmpty,
  getItemImageUrl,
  onLoadMore,
  canLoadMore,
  isLoadingMore,
}: ItemsListProps) {
  const {ds} = useTheme();
  const styles = createStyles(ds);

  const transformItemToListRow = useCallback(
    (item: Item): ListRowData => ({
      id: item.id,
      name: item.name,
      code: item.sku,
      image: getItemImageUrl(item),
      // badge: item.is_active ? 'ACTIVE' : 'INACTIVE',
      // badgeType: item.is_active ? 'active' : 'inactive',
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
      <View style={styles.footerMessage}>
        <ThemedText>Loading more...</ThemedText>
      </View>
    );
  }, [isLoadingMore, styles]);

  const handleEndReached = useCallback(() => {
    if (!canLoadMore || !onLoadMore) {
      return;
    }
    onLoadMore();
  }, [canLoadMore, onLoadMore]);

  if (isEmpty) {
    return (
      <RefreshableScrollView
        contentContainerStyle={styles.centerContainer}
        onRefresh={onRefresh}
      >
        <EmptyState
          message={
            searchQuery
              ? 'No items match your search.'
              : 'You have no items yet.'
          }
          icon={AppIcons.domain.itemOutline}
        />
      </RefreshableScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ModalFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onRefresh={onRefresh}
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
        paddingLeft: ds.spacing.xl * 3 + ds.spacing.xs,
      },
      errorText: {
        textAlign: 'center',
      },
      emptyText: {
        textAlign: 'center',
      },
      footerMessage: {
        paddingVertical: ds.spacing.md,
        alignItems: 'center',
      },
      listContentWithHeader: {
        paddingTop: 0,
      },
    }),
  (ds) => `${ds.version}`,
);

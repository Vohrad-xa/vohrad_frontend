import React, {useState, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {useItemsManager, type Item} from '@sykamore/store';
import {useLocalSearchParams, router, useNavigation} from 'expo-router';
import {
  ModalFlatList,
  ListRow,
  Divider,
  SelectionCircle,
  type ListRowData,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function ResourceSelectorModal() {
  const navigation = useNavigation();
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const params = useLocalSearchParams<{type?: string; selectedIds?: string}>();

  const initialSelectedId = params.selectedIds?.split(',')[0] ?? null;

  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );

  const {items, getItemImageUrl, hasNext, onEndReached} = useItemsManager();

  const handleSelect = useCallback((itemId: string) => {
    setSelectedId(itemId);
  }, []);

  const handleDone = useCallback(() => {
    if (!selectedId) {
      router.dismissTo({
        pathname: '/(app)/(tabs)/vault/add',
        params: {},
      });
      return;
    }

    const selectedItem = items.find((item) => item.id === selectedId);
    if (!selectedItem) {
      return;
    }

    router.dismissTo({
      pathname: '/(app)/(tabs)/vault/add',
      params: {
        targetType: 'item',
        targetId: selectedItem.id,
        itemName: selectedItem.name,
      },
    });
  }, [selectedId, items]);

  useSettingsHeader({
    navigation,
    isEditing: false,
    hasChanges: true,
    onSave: handleDone,
    idleAction: 'none',
  });

  const transformItemToListRow = useCallback(
    (item: Item): ListRowData => ({
      id: item.id,
      name: item.name,
      code: item.sku,
      image: getItemImageUrl(item),
      badge: item.is_active ? 'ACTIVE' : 'INACTIVE',
      badgeType: item.is_active ? 'active' : 'inactive',
      count: item.total_quantity,
      onPress: () => handleSelect(item.id),
    }),
    [getItemImageUrl, handleSelect],
  );

  const listData = useMemo(
    () => items.map(transformItemToListRow),
    [items, transformItemToListRow],
  );

  const renderItem = useCallback(
    ({item, index}: {item: ListRowData; index: number}) => {
      const itemData = items.find((i) => i.id === item.id);
      if (!itemData) return null;
      const isSelected = selectedId === item.id;

      return (
        <View>
          <ListRow
            item={item}
            showImage
            showChevron={false}
            customLeftIcon={<SelectionCircle selected={isSelected} />}
          />
          {index < listData.length - 1 && (
            <View style={styles.dividerContainer}>
              <Divider />
            </View>
          )}
        </View>
      );
    },
    [items, selectedId, listData.length, styles],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNext) return;
    onEndReached();
  }, [hasNext, onEndReached]);

  return (
    <ModalFlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      dividerContainer: {
        paddingLeft: ds.spacing.xxl + ds.spacing.sm,
        paddingRight: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

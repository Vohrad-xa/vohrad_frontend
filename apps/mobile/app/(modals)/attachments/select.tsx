import React, {useState, useCallback} from 'react';
import {useItemsManager, type Item} from '@sykamore/store';
import {useLocalSearchParams, router, useNavigation} from 'expo-router';
import {FlashList} from '@shopify/flash-list';
import {Divider, Checkbox, List} from 'react-native-paper';
import {useSettingsHeader} from '@/hooks';

export default function ResourceSelectorModal() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{type?: string; selectedIds?: string}>();
  const initialSelectedId = params.selectedIds?.split(',')[0] ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );

  const {items, hasNext, onEndReached} = useItemsManager();

  const handleDone = useCallback(() => {
    if (!selectedId) {
      router.dismissTo({
        pathname: '/(tabs)/vault/add',
        params: {},
      });
      return;
    }

    const selectedItem = items.find((item) => item.id === selectedId);
    if (!selectedItem) return;

    router.dismissTo({
      pathname: '/(tabs)/vault/add',
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

  const renderItem = useCallback(
    ({item}: {item: Item}) => (
      <List.Item
        title={item.name}
        description={item.sku}
        onPress={() => setSelectedId(item.id)}
        left={(props) => (
          <Checkbox
            {...props}
            status={selectedId === item.id ? 'checked' : 'unchecked'}
          />
        )}
      />
    ),
    [selectedId],
  );

  const handleEndReached = useCallback(() => {
    if (hasNext) onEndReached();
  }, [hasNext, onEndReached]);

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Divider}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

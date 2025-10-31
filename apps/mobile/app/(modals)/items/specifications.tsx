import React from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import {ModalScrollView, EmptyState} from '@/components/ui';
import {ItemSpecifications} from '@/features/item/detail/specifications/item-specifications';

export default function SpecificationsModal() {
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item, isLoading} = useItemDetailManager(itemId);

  const hasSpecifications =
    item?.specifications && Object.keys(item.specifications).length > 0;

  if (!isLoading && !hasSpecifications) {
    return (
      <EmptyState
        message="No specifications found for this item"
        icon="hardware-chip-outline"
      />
    );
  }

  return (
    <ModalScrollView>
      <ItemSpecifications />
    </ModalScrollView>
  );
}

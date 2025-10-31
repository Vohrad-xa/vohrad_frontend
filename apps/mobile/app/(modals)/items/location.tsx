import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {useItemDetailManager} from '@vohrad/store';
import {ModalScrollView, EmptyState} from '@/components/ui';
import {ItemLocation} from '@/features/item/detail/locations/item-location';

export default function LocationModal() {
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item, isLoading} = useItemDetailManager(itemId);

  const displayLocations = item?.locations ?? [];

  if (!isLoading && displayLocations.length === 0) {
    return (
      <EmptyState
        message="No locations found for this item"
        icon="locate-outline"
      />
    );
  }

  return (
    <ModalScrollView>
      <ItemLocation />
    </ModalScrollView>
  );
}

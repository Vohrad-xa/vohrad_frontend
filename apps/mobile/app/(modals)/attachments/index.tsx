import React from 'react';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ModalScrollView, ThemedText} from '@/components/ui';

export default function AttachmentDestinationSelectorModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{selectedIds?: string}>();
  const selectedIds = params.selectedIds;

  return (
    <ModalScrollView>
      <Card>
        <Card.Row
          icon="albums-outline"
          accessibilityLabel="Select item"
          onPress={() =>
            router.push({
              pathname: '/(modals)/attachments/select',
              params: selectedIds
                ? {type: 'items', selectedIds}
                : {type: 'items'},
            })
          }
        >
          <ThemedText variant="label">Items</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="locate-outline"
          accessibilityLabel="Select location"
          onPress={() =>
            router.push({
              pathname: '/(modals)/attachments/select',
              params: selectedIds
                ? {type: 'locations', selectedIds}
                : {type: 'locations'},
            })
          }
        >
          <ThemedText variant="label">Locations</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="layers-outline"
          accessibilityLabel="Select item location"
          onPress={() =>
            router.push({
              pathname: '/(modals)/attachments/select',
              params: selectedIds
                ? {type: 'item_locations', selectedIds}
                : {type: 'item_locations'},
            })
          }
        >
          <ThemedText variant="label">Maintenances</ThemedText>
        </Card.Row>
      </Card>
    </ModalScrollView>
  );
}

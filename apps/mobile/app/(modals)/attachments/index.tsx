import React from 'react';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ModalScrollView, ThemedText} from '@/components/ui';
import {AppIcons} from '@/utils/icons';

export default function AttachmentDestinationSelectorModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{selectedIds?: string}>();
  const selectedIds = params.selectedIds;

  return (
    <ModalScrollView>
      <Card>
        <Card.Row
          icon={AppIcons.domain.item}
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
          icon={AppIcons.domain.location}
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
      </Card>
    </ModalScrollView>
  );
}

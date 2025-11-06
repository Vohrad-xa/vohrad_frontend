import React, {useCallback} from 'react';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {AttachmentsOverview} from '@/features/attachments/screens/attachments-overview';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';

export default function ItemAttachmentsModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{id?: string}>();
  const {counts, item} = useItemAttachments();

  const itemId =
    item?.id ?? (typeof params.id === 'string' ? params.id : undefined);

  const handleImagesPress = useCallback(() => {
    if (!itemId) {
      return;
    }

    router.push({
      pathname: '/items/attachments/images',
      params: {id: itemId},
    });
  }, [itemId, router]);

  return (
    <ModalScrollView>
      <AttachmentsOverview
        counts={counts}
        onTilePress={{
          image: handleImagesPress,
        }}
      />
    </ModalScrollView>
  );
}

import {useMemo} from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import {computeAttachmentCounts} from '@/features/attachments/utils/attachment-counts';

export function useItemAttachments() {
  const {id: itemId} = useLocalSearchParams<{id?: string}>();
  const {item, isLoading} = useItemDetailManager(itemId);

  const attachments = useMemo(
    () => item?.attachments ?? [],
    [item?.attachments],
  );

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  const total = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  return {
    counts,
    total,
    attachments,
    item,
    isLoading,
  };
}

import {useLocalSearchParams} from 'expo-router';
import {useAttachmentUpload} from '@/features/attachments/hooks';

export function useItemAttachmentUpload() {
  const {id: itemId} = useLocalSearchParams<{id?: string}>();
  return useAttachmentUpload('item', itemId);
}

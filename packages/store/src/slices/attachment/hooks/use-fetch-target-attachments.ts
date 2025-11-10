import {useCallback} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import type {ItemAttachment, AttachmentTargetType} from '@vohrad/types';
import type {AttachmentTargetKey} from '../slice';

export function useFetchTargetAttachments() {
  const setTargetLoading = useAuthStore((state) => state.setTargetLoading);
  const setTargetError = useAuthStore((state) => state.setTargetError);
  const setAttachmentsForTarget = useAuthStore(
    (state) => state.setAttachmentsForTarget,
  );

  const fetchTargetAttachments = useCallback(
    async (
      targetType: AttachmentTargetType,
      targetId: string,
      targetKey: AttachmentTargetKey,
      params?: {page?: number; size?: number},
    ): Promise<ItemAttachment[]> => {
      const page = params?.page ?? 1;
      const size = params?.size ?? 50;

      setTargetLoading(targetKey, true);
      setTargetError(targetKey, null);

      try {
        const response = await attachmentApi.listAttachments({
          targetType,
          targetId,
          page,
          size,
        });
        const items = response.data.items ?? [];
        setAttachmentsForTarget(targetKey, items);
        return items;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load attachments right now.';

        setTargetError(targetKey, message);

        useAuthStore.setState({error: message, retryCallback: null});

        throw err;
      } finally {
        setTargetLoading(targetKey, false);
      }
    },
    [setTargetLoading, setTargetError, setAttachmentsForTarget],
  );

  return {fetchTargetAttachments};
}

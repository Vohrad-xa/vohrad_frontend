import {useCallback} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import type {ItemAttachment, AttachmentTargetType} from '@vohrad/types';
import type {AttachmentTargetKey} from '../slice';

type FetchTargetAttachmentsDeps = {
  setTargetLoading: (targetKey: AttachmentTargetKey, loading: boolean) => void;
  setTargetError: (
    targetKey: AttachmentTargetKey,
    error: string | null,
  ) => void;
  setAttachmentsForTarget: (
    targetKey: AttachmentTargetKey,
    attachments: ItemAttachment[],
  ) => void;
  removeAttachmentForTarget: (
    targetKey: AttachmentTargetKey,
    attachmentId: string,
  ) => void;
};

export function useFetchTargetAttachments(deps: FetchTargetAttachmentsDeps) {
  const {
    setTargetLoading,
    setTargetError,
    setAttachmentsForTarget,
    removeAttachmentForTarget,
  } = deps;

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

        // Still propagate error to global state for top-level error handlers
        useAuthStore.setState({error: message, retryCallback: null});

        throw err;
      }
    },
    [
      setTargetLoading,
      setTargetError,
      setAttachmentsForTarget,
      removeAttachmentForTarget,
    ],
  );

  return {fetchTargetAttachments};
}

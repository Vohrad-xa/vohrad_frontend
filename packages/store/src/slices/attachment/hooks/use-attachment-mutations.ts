import {useState, useCallback} from 'react';
import {attachmentApi} from '@vohrad/api-client';
import {useAuthStore} from '../../../store';
import type {ItemAttachment} from '@vohrad/types';

type DeleteAttachmentOptions = {
  hardDelete?: boolean;
};

export function useUploadAttachment() {
  const [isLoading, setIsLoading] = useState(false);

  const uploadAttachment = useCallback(
    async (formData: FormData): Promise<ItemAttachment> => {
      setIsLoading(true);

      try {
        const attachment = await attachmentApi.uploadAttachment(formData);
        return attachment;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to upload attachment right now.';

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: null});

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    uploadAttachment,
    isLoading,
  };
}

export function useDeleteAttachment() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteAttachment = useCallback(
    async (
      attachmentId: string,
      options?: DeleteAttachmentOptions,
    ): Promise<void> => {
      setIsLoading(true);

      try {
        await attachmentApi.deleteAttachment(attachmentId, {
          hardDelete: options?.hardDelete,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to delete attachment right now.';

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: null});

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    deleteAttachment,
    isLoading,
  };
}

import {useCallback} from 'react';
import type {ItemAttachment, AttachmentTargetType} from '@sykamore/types';
import {
  useFetchTargetAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '../hooks';

type UseAttachmentManagerOptions = {
  enabled?: boolean;
};

const EMPTY_ATTACHMENTS: ItemAttachment[] = [];

export function useAttachmentManager(
  targetType: AttachmentTargetType,
  targetId: string | null,
  options?: UseAttachmentManagerOptions,
) {
  const {
    data: attachments,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchTargetAttachments(targetType, targetId, options?.enabled);

  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();

  const uploadAttachment = useCallback(
    (formData: FormData) => {
      return uploadMutation.mutateAsync(formData);
    },
    [uploadMutation],
  );

  const deleteAttachment = useCallback(
    (attachmentId: string, deleteOptions?: {hardDelete?: boolean}) => {
      return deleteMutation.mutateAsync({
        attachmentId,
        hardDelete: deleteOptions?.hardDelete,
      });
    },
    [deleteMutation],
  );

  return {
    attachments: attachments ?? EMPTY_ATTACHMENTS,
    isLoading:
      isLoading || uploadMutation.isPending || deleteMutation.isPending,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isError: isError || uploadMutation.isError || deleteMutation.isError,
    error: error || uploadMutation.error || deleteMutation.error,
    fetchAttachments: refetch,
    uploadAttachment,
    deleteAttachment,
  };
}

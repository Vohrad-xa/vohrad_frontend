// import {useCallback, useMemo} from 'react';
// import type {AttachmentTargetType} from '@sykamore/types';
// import {useUploadAttachment, useDeleteAttachment} from '../hooks';
// import {useAttachmentsListManager} from './use-attachments-list-manager';

// type UseAttachmentManagerOptions = {
//   enabled?: boolean;
//   pageSize?: number;
// };

// export function useAttachmentManager(
//   targetType: AttachmentTargetType,
//   targetId: string | null,
//   options?: UseAttachmentManagerOptions,
// ) {
//   const hasTarget = Boolean(targetId && targetType);
//   const filters = useMemo(
//     () => (hasTarget ? {targetType, targetId: targetId!} : {}),
//     [hasTarget, targetType, targetId],
//   );

//   const {
//     attachments,
//     isLoading,
//     error,
//     refresh,
//     hasNext,
//     loadMore,
//     lastUpdated,
//   } = useAttachmentsListManager({
//     filters,
//     pageSize: options?.pageSize,
//     enabled: options?.enabled ?? hasTarget,
//   });

//   const uploadMutation = useUploadAttachment();
//   const deleteMutation = useDeleteAttachment();

//   const uploadAttachment = useCallback(
//     (formData: FormData) => {
//       return uploadMutation.mutateAsync(formData);
//     },
//     [uploadMutation],
//   );

//   const deleteAttachment = useCallback(
//     (attachmentId: string, deleteOptions?: {hardDelete?: boolean}) => {
//       return deleteMutation.mutateAsync({
//         attachmentId,
//         hardDelete: deleteOptions?.hardDelete,
//       });
//     },
//     [deleteMutation],
//   );

//   const fetchAttachments = useCallback(async () => {
//     if (!hasTarget) return;
//     await refresh();
//   }, [hasTarget, refresh]);

//   return {
//     attachments,
//     isLoading:
//       isLoading || uploadMutation.isPending || deleteMutation.isPending,
//     isUploading: uploadMutation.isPending,
//     isDeleting: deleteMutation.isPending,
//     isError: Boolean(error || uploadMutation.isError || deleteMutation.isError),
//     error: error || uploadMutation.error || deleteMutation.error,
//     fetchAttachments,
//     hasNext,
//     loadMore,
//     lastUpdated,
//     uploadAttachment,
//     deleteAttachment,
//   };
// }

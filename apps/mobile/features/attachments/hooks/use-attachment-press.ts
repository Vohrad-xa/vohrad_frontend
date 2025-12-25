import {useCallback} from 'react';
import {Linking, Platform} from 'react-native';
import {errorManager} from '@sykamore/api-client';
import {useRouter} from 'expo-router';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {useNetworkConnectivity} from '@/modules/network';
import {showAlert} from '@/utils';
import {resolveAttachmentItemUrl} from '../utils';
import type {ItemAttachment} from '@sykamore/types';

// handling the opening of attachments
export function useAttachmentPress() {
  const router = useRouter();
  const {checkBackendReachability} = useNetworkConnectivity();

  const handleAttachmentPress = useCallback(
    async (attachment: ItemAttachment) => {
      const hasConnectivity = await checkBackendReachability({
        remindOffline: true,
      });
      if (!hasConnectivity) {
        errorManager.reportError(
          'Connection failed. Please reconnect and try again.',
          undefined,
          undefined,
          {
            category: 'network',
            isRetryable: false,
            scope: 'local',
          },
        );
        return;
      }

      try {
        const sourceUrl = await resolveAttachmentItemUrl(attachment);

        // Handle images
        if (attachment.kind === 'image') {
          router.push({
            pathname: '/(modals)/preview/image',
            params: {
              attachmentId: attachment.id,
              sourceUrl,
              originalFilename:
                attachment.original_filename ?? attachment.filename ?? '',
            },
          });
          return;
        }

        // Handle archives and other files - download and share
        if (attachment.kind === 'archive' || attachment.kind === 'other') {
          const localPath = await downloadDocumentFile({
            sourceUrl,
            id: attachment.id,
            originalFilename:
              attachment.original_filename ?? attachment.filename ?? '',
            extension: attachment.extension ?? '',
          });

          await shareDownloadedFile(
            localPath,
            attachment.original_filename ??
              (attachment.kind === 'archive' ? 'archive' : 'file'),
            attachment.file_type,
          );
          return;
        }

        // Handle documents and videos

        // Web/Android: Open with system app
        if (Platform.OS === 'web' || Platform.OS === 'android') {
          await Linking.openURL(sourceUrl);
          return;
        }

        // iOS: Open in document preview modal
        router.push({
          pathname: '/(modals)/preview/document',
          params: {
            attachmentId: attachment.id,
            sourceUrl,
            originalFilename:
              attachment.original_filename ?? attachment.filename ?? '',
            filename: attachment.filename ?? '',
            extension: attachment.extension ?? '',
            fileType: attachment.file_type ?? '',
          },
        });
      } catch (error) {
        console.error('Failed to open attachment:', error);
        const kindLabel =
          attachment.kind === 'image'
            ? 'image'
            : attachment.kind === 'archive'
              ? 'archive'
              : attachment.kind === 'other'
                ? 'file'
                : attachment.kind === 'document'
                  ? 'document'
                  : 'file';
        showAlert({
          title: `Unable to open ${kindLabel}`,
          message: 'Please try again in a few moments.',
        });
      }
    },
    [router, checkBackendReachability],
  );

  return handleAttachmentPress;
}

import {useCallback} from 'react';
import {Linking, Platform} from 'react-native';
import {errorCenter} from '@sykamore/client-runtime';
import {resolveAttachmentItemUrl} from '@sykamore/store';
import {useRouter} from 'expo-router';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {useNetworkConnectivity} from '@/features/network';
import type {ItemAttachment} from '@sykamore/types';

export function useAttachmentPress() {
  const router = useRouter();
  const {checkBackendReachability} = useNetworkConnectivity();

  const handleAttachmentPress = useCallback(
    async (attachment: ItemAttachment) => {
      const hasConnectivity = await checkBackendReachability({
        remindOffline: true,
      });
      if (!hasConnectivity) {
        errorCenter.report(
          'Connection failed. Please reconnect and try again.',
          {
            category: 'network',
            title: 'Connection Error',
            isRetryable: false,
            scope: 'local',
          },
        );
        return;
      }

      try {
        const sourceUrl = await resolveAttachmentItemUrl(attachment);

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
            attachment.original_filename ?? attachment.filename ?? '',
            attachment.file_type,
          );
          return;
        }

        if (attachment.kind === 'document') {
          if (Platform.OS === 'ios') {
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
            return;
          }

          await Linking.openURL(sourceUrl);
          return;
        }

        await Linking.openURL(sourceUrl);
      } catch (error) {
        errorCenter.report(error, {
          title: 'Attachment unavailable',
          scope: 'local',
        });
      }
    },
    [checkBackendReachability, router],
  );

  return handleAttachmentPress;
}

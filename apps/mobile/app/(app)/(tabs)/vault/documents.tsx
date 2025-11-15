import React, {useCallback} from 'react';
import {Linking, Platform} from 'react-native';
import {errorManager} from '@vohrad/api-client';
import {useRouter} from 'expo-router';
import {useAttachmentDocuments} from '@/features/attachments';
import {DocumentsList} from '@/features/attachments/screens/documents';
import {useNetworkConnectivity} from '@/modules/network';
import {showAlert} from '@/utils';

export default function VaultDocumentsScreen() {
  const router = useRouter();
  const {checkBackendReachability} = useNetworkConnectivity();
  const {documentAttachments, getDocumentById, resolveDocumentUrlById} =
    useAttachmentDocuments();

  const handleDocumentPress = useCallback(
    async (documentId: string) => {
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

      if (Platform.OS === 'web' || Platform.OS === 'android') {
        // For web/android, open directly with linking
        try {
          const sourceUrl = await resolveDocumentUrlById(documentId);
          if (sourceUrl) {
            await Linking.openURL(sourceUrl);
          }
        } catch (error) {
          console.error('Failed to open document:', error);
          showAlert({
            title: 'Unable to open document',
            message: 'Please try again in a few moments.',
          });
        }
        return;
      }

      // For iOS, open modal
      const attachment = getDocumentById(documentId);
      if (!attachment) {
        return;
      }

      try {
        const sourceUrl = await resolveDocumentUrlById(documentId);
        router.push({
          pathname: '/(modals)/preview/document',
          params: {
            attachmentId: documentId,
            sourceUrl,
            originalFilename:
              attachment.original_filename ?? attachment.filename ?? '',
            filename: attachment.filename ?? '',
            extension: attachment.extension ?? '',
            fileType: attachment.file_type ?? '',
          },
        });
      } catch (error) {
        console.error('Failed to open document preview:', error);
        showAlert({
          title: 'Unable to open document',
          message: 'Please try again in a few moments.',
        });
      }
    },
    [checkBackendReachability, getDocumentById, resolveDocumentUrlById, router],
  );

  return (
    <DocumentsList
      documents={documentAttachments}
      onDocumentPress={handleDocumentPress}
    />
  );
}

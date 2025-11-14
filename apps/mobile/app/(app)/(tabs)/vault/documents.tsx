import React, {useCallback} from 'react';
import {useRouter} from 'expo-router';
import {useAttachmentDocuments} from '@/features/attachments';
import {DocumentsList} from '@/features/attachments/screens/documents';
import {showAlert} from '@/utils';

export default function VaultDocumentsScreen() {
  const router = useRouter();
  const {documentAttachments, getDocumentById, resolveDocumentUrlById} =
    useAttachmentDocuments();

  const handleDocumentPress = useCallback(
    (documentId: string) => {
      const attachment = getDocumentById(documentId);
      if (!attachment) {
        return;
      }

      void (async () => {
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
      })();
    },
    [getDocumentById, resolveDocumentUrlById, router],
  );

  return (
    <DocumentsList
      documents={documentAttachments}
      onDocumentPress={handleDocumentPress}
    />
  );
}

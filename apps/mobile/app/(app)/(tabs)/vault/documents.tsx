import React, {useCallback} from 'react';
import {
  useAttachmentDocuments,
  useAttachmentPress,
} from '@/features/attachments';
import {DocumentsList} from '@/features/attachments/screens/documents';

export default function VaultDocumentsScreen() {
  const {documentAttachments, getDocumentById} = useAttachmentDocuments();
  const handleAttachmentPress = useAttachmentPress();

  const handleDocumentPress = useCallback(
    async (documentId: string) => {
      const attachment = getDocumentById(documentId);
      if (!attachment) {
        return;
      }
      await handleAttachmentPress(attachment);
    },
    [getDocumentById, handleAttachmentPress],
  );

  return (
    <DocumentsList
      documents={documentAttachments}
      onDocumentPress={handleDocumentPress}
    />
  );
}

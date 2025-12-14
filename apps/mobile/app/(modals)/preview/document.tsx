import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {AttachmentDocumentPreview} from '@/features/attachments';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {AppIcons, showAlert} from '@/utils';

type DocumentPreviewParams = {
  attachmentId?: string | string[];
  sourceUrl?: string;
  originalFilename?: string;
  filename?: string;
  extension?: string;
  fileType?: string;
  id?: string;
};

export default function DocumentPreviewModal() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<DocumentPreviewParams>();

  const [isDownloading, setIsDownloading] = useState(false);

  const documentParams = useMemo(() => {
    const normalize = (value?: string | string[]) =>
      typeof value === 'string' && value.length > 0 ? value : undefined;

    return {
      id: normalize(params.attachmentId) ?? 'document',
      sourceUrl: normalize(params.sourceUrl),
      originalFilename: normalize(params.originalFilename),
      filename: normalize(params.filename),
      extension: normalize(params.extension),
      fileType: normalize(params.fileType),
    };
  }, [params]);

  const documentTitle =
    documentParams.originalFilename ?? documentParams.filename ?? 'Document';

  const handleDownload = useCallback(async () => {
    if (!documentParams.sourceUrl) {
      showAlert({
        title: 'Document unavailable',
        message: 'Missing document URL. Please close and try again.',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const localPath = await downloadDocumentFile({
        sourceUrl: documentParams.sourceUrl!,
        id: documentParams.id!,
        originalFilename: documentParams.originalFilename ?? '',
        extension: documentParams.extension ?? '',
      });

      await shareDownloadedFile(
        localPath,
        documentTitle,
        documentParams.fileType,
      );
    } catch (error) {
      console.error('Failed to download document:', error);
      showAlert({
        title: 'Download failed',
        message: 'Unable to download this document. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [documentParams, documentTitle]);

  useEffect(() => {
    navigation.setOptions({
      title: documentTitle,
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.actions.download}
          variant="action"
          onPress={isDownloading ? undefined : handleDownload}
          accessibilityLabel={
            isDownloading ? 'Sharing document' : 'Share document'
          }
        />
      ),
    });
  }, [navigation, documentTitle, handleDownload, isDownloading]);

  return <AttachmentDocumentPreview attachment={documentParams} />;
}

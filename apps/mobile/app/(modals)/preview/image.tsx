import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFilteredAttachmentsManager} from '@sykamore/store';
import {useNavigation, useLocalSearchParams} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {
  AttachmentImagePreview,
  useImageAttachments,
  useOptionalAttachmentContext,
} from '@/features/attachments';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {AppIcons, showAlert} from '@/utils';

export default function AttachmentImagePreviewModal() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    attachmentId?: string;
  }>();

  const [isDownloading, setIsDownloading] = useState(false);

  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  // Try to use context attachments first
  const context = useOptionalAttachmentContext();
  const hasContext = !!context?.attachments?.length;

  // Only fetch if we don't have context
  const {attachments: fetchedAttachments} = useFilteredAttachmentsManager({
    kind: 'image',
    enabled: !hasContext,
  });

  const attachments = hasContext ? context.attachments : fetchedAttachments;

  const imageAttachments = useImageAttachments(attachments);

  const currentAttachment = useMemo(() => {
    return (
      imageAttachments.find((img) => img.id === initialId) ??
      imageAttachments[0]
    );
  }, [imageAttachments, initialId]);

  const handleDownload = useCallback(async () => {
    if (!currentAttachment?.resolvedUrl) {
      showAlert({
        title: 'Image unavailable',
        message: 'Missing image URL. Please close and try again.',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const localPath = await downloadDocumentFile({
        sourceUrl: currentAttachment.resolvedUrl!,
        id: currentAttachment.id,
        originalFilename: currentAttachment.original_filename ?? '',
        extension: currentAttachment.extension ?? '',
      });

      await shareDownloadedFile(
        localPath,
        currentAttachment.original_filename ?? 'image',
        currentAttachment.file_type,
      );
    } catch (error) {
      console.error('Failed to download image:', error);
      showAlert({
        title: 'Download failed',
        message: 'Unable to download this image. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [currentAttachment]);

  useEffect(() => {
    const title = currentAttachment?.original_filename ?? 'Image';
    navigation.setOptions({
      title,
      headerRight: () => (
        <HeaderButton
          icon={AppIcons.actions.download}
          onPress={isDownloading ? undefined : handleDownload}
          accessibilityLabel={isDownloading ? 'Sharing image' : 'Share image'}
          iconColorToken="accentBlue"
        />
      ),
    });
  }, [navigation, currentAttachment, handleDownload, isDownloading]);

  if (!imageAttachments.length) {
    return null;
  }

  return (
    <AttachmentImagePreview
      attachments={imageAttachments}
      initialAttachmentId={initialId}
    />
  );
}

import type {ItemAttachment} from '@sykamore/types';
import {
  resolveAttachmentPreviewUrl,
  resolveAttachmentThumbnailUrl,
} from '../../../utils/attachment-urls';
import {formatDateShort} from '../../../utils/format-date';
import {
  resolveAttachmentIconKey,
  type AttachmentIconKey,
} from './attachment-icon';
import {formatBytes} from './format-bytes';
import {normalizeAttachmentExtension} from './normalizers';

export type AttachmentDisplayData = {
  uiTitle: string;
  uiDescription: string;
  iconKey: AttachmentIconKey;
  thumbnailUrl: string | null;
  previewUrl: string | null;
};

export type AttachmentDisplayItem = ItemAttachment & AttachmentDisplayData;

export function buildAttachmentDisplayData(
  attachment: ItemAttachment,
): AttachmentDisplayData {
  const uiTitle =
    attachment.original_filename ?? attachment.filename ?? 'Untitled';

  const previewUrl = resolveAttachmentPreviewUrl(attachment);

  const fileSize = formatBytes(Number(attachment.size));

  const dateAdded = attachment.created_at
    ? formatDateShort(attachment.created_at)
    : '—';

  const fileType = attachment.file_type?.toLowerCase() ?? '';

  const normalizedExtension = normalizeAttachmentExtension(
    attachment.extension,
  );

  const isPdf = fileType === 'application/pdf' || normalizedExtension === 'pdf';

  const isImage =
    (attachment.kind ?? '').toLowerCase() === 'image' ||
    fileType.startsWith('image/');

  const thumbnailUrl =
    isPdf || isImage ? resolveAttachmentThumbnailUrl(attachment) : null;

  const iconKey = resolveAttachmentIconKey({
    filename: uiTitle,
    extension: attachment.extension ?? null,
    fileType: attachment.file_type ?? null,
  });

  return {
    uiTitle,
    uiDescription: `${dateAdded} - ${fileSize}`,
    iconKey,
    thumbnailUrl,
    previewUrl,
  };
}

export function buildAttachmentDisplayItems(
  attachments?: ItemAttachment[] | null,
): AttachmentDisplayItem[] {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  return attachments.map((attachment) => ({
    ...attachment,
    ...buildAttachmentDisplayData(attachment),
  }));
}

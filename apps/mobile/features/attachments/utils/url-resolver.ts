import {attachmentApi, resolveAttachmentUrl} from '@sykamore/api-client';
import type {ItemAttachment} from '@sykamore/types';

export async function resolveAttachmentItemUrl(
  attachment: ItemAttachment,
): Promise<string> {
  const {download_url: downloadUrl, file_path: filePath} = attachment;

  if (downloadUrl?.startsWith('http')) {
    return downloadUrl;
  }

  const relativeFromDownload = normalizeRelativePath(downloadUrl);
  if (relativeFromDownload) {
    return resolveAttachmentUrl(relativeFromDownload);
  }

  const relativeFromFilePath = normalizeFilePath(filePath);
  if (relativeFromFilePath) {
    return resolveAttachmentUrl(relativeFromFilePath);
  }

  return attachmentApi.getAttachmentUrl(attachment.id);
}

function normalizeRelativePath(path?: string | null): string | null {
  if (!path) return null;
  let sanitized = path.trim();
  if (!sanitized) return null;

  if (sanitized.startsWith('file://')) {
    sanitized = sanitized.replace('file://', '');
  }

  if (!sanitized.startsWith('/')) {
    sanitized = `/${sanitized}`;
  }

  return sanitized.replace(/\/{2,}/g, '/');
}

function normalizeFilePath(path?: string | null): string | null {
  if (!path) return null;
  const sanitized = path.replace(/^\/+/, '');
  if (!sanitized) return null;

  if (sanitized.startsWith('attachments/')) {
    return `/${sanitized}`;
  }

  return `/attachments/${sanitized}`;
}

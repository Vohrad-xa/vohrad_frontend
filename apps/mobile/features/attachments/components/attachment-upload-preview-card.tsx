import React from 'react';
import {Card} from '@/components/cards/card';
import {ListRow, type ListRowData} from '@/components/ui';

type AttachmentUploadPreviewCardProps = {
  name: string;
  mimeType?: string;
  size?: number;
};

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return undefined;
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = size >= 100 ? Math.round(size).toString() : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

export function AttachmentUploadPreviewCard({
  name,
  mimeType,
  size,
}: AttachmentUploadPreviewCardProps) {
  const formattedSize = formatFileSize(size);
  const secondaryLabel = [mimeType, formattedSize].filter(Boolean).join(' • ');

  const item: ListRowData = {
    id: 'pending-attachment',
    name,
    code: secondaryLabel,
  };

  return (
    <Card>
      <ListRow item={item} showImage />
    </Card>
  );
}

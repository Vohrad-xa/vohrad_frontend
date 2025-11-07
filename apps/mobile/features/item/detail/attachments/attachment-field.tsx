import React from 'react';
import {ThemedText} from '@/components/ui';

interface AttachmentFieldProps {
  itemId?: string;
}

export function AttachmentField({
  itemId: _itemId,
}: AttachmentFieldProps): React.JSX.Element {
  return <ThemedText variant="label">Attachments</ThemedText>;
}

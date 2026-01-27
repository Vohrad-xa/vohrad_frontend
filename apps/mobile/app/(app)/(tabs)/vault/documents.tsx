import React from 'react';
import {AttachmentKindView} from '@/features/attachments';

export default function VaultDocumentsScreen() {
  return (
    <AttachmentKindView
      kind="document"
      title="Documents"
      labelSingular="document"
      labelPlural="documents"
      listKey="documents"
      showExtensionFilter
    />
  );
}

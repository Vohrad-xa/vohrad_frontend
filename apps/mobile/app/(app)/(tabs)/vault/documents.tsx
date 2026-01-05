import React from 'react';
import {AttachmentKindScreen} from '@/features/attachments';

export default function VaultDocumentsScreen() {
  return (
    <AttachmentKindScreen
      kind="document"
      title="Documents"
      labelSingular="document"
      labelPlural="documents"
      listKey="documents"
      showExtensionFilter
    />
  );
}

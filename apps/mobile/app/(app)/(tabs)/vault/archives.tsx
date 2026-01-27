import React from 'react';
import {AttachmentKindView} from '@/features/attachments';

export default function VaultArchivesScreen() {
  return (
    <AttachmentKindView
      kind="archive"
      title="Archives"
      labelSingular="archive"
      labelPlural="archives"
      listKey="archives"
      showExtensionFilter={false}
    />
  );
}

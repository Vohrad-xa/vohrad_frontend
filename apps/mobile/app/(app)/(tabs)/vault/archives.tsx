import React from 'react';
import {AttachmentKindScreen} from '@/features/attachments';

export default function VaultArchivesScreen() {
  return (
    <AttachmentKindScreen
      kind="archive"
      title="Archives"
      labelSingular="archive"
      labelPlural="archives"
      listKey="archives"
      showExtensionFilter={false}
    />
  );
}

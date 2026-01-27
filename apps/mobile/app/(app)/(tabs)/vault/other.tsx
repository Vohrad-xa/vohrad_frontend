import React from 'react';
import {AttachmentKindView} from '@/features/attachments';

export default function VaultOtherScreen() {
  return (
    <AttachmentKindView
      kind="other"
      title="Other Attachments"
      labelSingular="other attachment"
      labelPlural="other attachments"
      deleteTitle="Other Attachments"
      listKey="other"
      showExtensionFilter={false}
    />
  );
}

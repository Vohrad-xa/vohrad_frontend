import React from 'react';
import {AttachmentKindScreen} from '@/features/attachments';

export default function VaultOtherScreen() {
  return (
    <AttachmentKindScreen
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

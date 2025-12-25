import React, {useCallback} from 'react';
import {useAttachmentsByKind, useAttachmentPress} from '@/features/attachments';
import {OtherList} from '@/features/attachments/screens/other';

export default function VaultOtherScreen() {
  const {attachments: otherAttachments, getById: getOtherById} =
    useAttachmentsByKind('other');
  const handleAttachmentPress = useAttachmentPress();

  const handleOtherPress = useCallback(
    async (otherId: string) => {
      const attachment = getOtherById(otherId);
      if (!attachment) {
        return;
      }
      await handleAttachmentPress(attachment);
    },
    [getOtherById, handleAttachmentPress],
  );

  return (
    <OtherList others={otherAttachments} onOtherPress={handleOtherPress} />
  );
}

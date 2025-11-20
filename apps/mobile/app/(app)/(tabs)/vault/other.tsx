import React, {useCallback} from 'react';
import {useAttachmentOther, useAttachmentPress} from '@/features/attachments';
import {OtherList} from '@/features/attachments/screens/other';

export default function VaultOtherScreen() {
  const {otherAttachments, getOtherById} = useAttachmentOther();
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

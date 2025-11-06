import React, {useCallback} from 'react';
import {ModalScrollView} from '@/components/ui';
import {AttachmentAddOptions} from '@/features/item/detail/attachments/attachment-add-options';

export default function ItemAttachmentAddModal() {
  const handleTakePicture = useCallback(() => {
    // Camera flow will be handled in a future iteration.
  }, []);

  const handleUploadFiles = useCallback(() => {
    // File upload flow will be handled in a future iteration.
  }, []);

  return (
    <ModalScrollView>
      <AttachmentAddOptions
        onTakePicture={handleTakePicture}
        onUploadFiles={handleUploadFiles}
      />
    </ModalScrollView>
  );
}

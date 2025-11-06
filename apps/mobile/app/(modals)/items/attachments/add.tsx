import React, {useCallback, useEffect, useRef} from 'react';
import {useNavigation, useRouter} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {
  AttachmentAddOptions,
  AttachmentUploadPreviewCard,
} from '@/features/attachments/components';
import {useItemAttachmentUpload} from '@/features/item/detail/attachments/use-item-attachment-upload';
import {useSettingsHeader} from '@/hooks';

export default function ItemAttachmentAddModal() {
  const navigation = useNavigation();
  const router = useRouter();

  const {
    selectFromDevice,
    capturePhoto,
    savePendingAttachment,
    pendingMetadata,
    hasPending,
  } = useItemAttachmentUpload();
  const saveHandlerRef = useRef<() => Promise<void>>(async () => {});

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: false,
    hasChanges: hasPending,
    onSave: () => {
      void saveHandlerRef.current();
    },
    onClose: handleClose,
    idleAction: 'none',
  });

  useEffect(() => {
    saveHandlerRef.current = async () => {
      const saved = await savePendingAttachment();
      if (saved) {
        triggerSuccess();
      }
    };
  }, [savePendingAttachment, triggerSuccess]);

  const handleTakePicture = useCallback(() => {
    void capturePhoto();
  }, [capturePhoto]);

  const handleUploadFiles = useCallback(() => {
    void selectFromDevice();
  }, [selectFromDevice]);

  return (
    <ModalScrollView>
      <AttachmentAddOptions
        onTakePicture={handleTakePicture}
        onUploadFiles={handleUploadFiles}
      />
      {pendingMetadata && (
        <AttachmentUploadPreviewCard
          name={pendingMetadata.name}
          mimeType={pendingMetadata.mimeType}
          size={pendingMetadata.size}
        />
      )}
    </ModalScrollView>
  );
}

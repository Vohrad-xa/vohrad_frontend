import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRouter} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentAddOptions,
  AttachmentUploadPreviewCard,
} from '@/features/attachments/components';
import {useItemAttachmentUpload} from '@/features/item/detail/attachments/use-item-attachment-upload';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemAttachmentAddModal() {
  const navigation = useNavigation();
  const router = useRouter();
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

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
      <View style={styles.contentContainer}>
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
      </View>
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        gap: ds.spacing.xl,
      },
    }),
  (ds, theme) => `${ds.version}-${theme.background}`,
);

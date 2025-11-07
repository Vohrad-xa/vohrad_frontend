import React, {useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useLocalSearchParams} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentAddOptions,
  AttachmentUploadPreviewCard,
} from '@/features/attachments';
import {useAttachmentUpload} from '@/features/attachments/hooks';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import type {AttachmentTargetType} from '@vohrad/store';

export default function AttachmentAddModal() {
  const navigation = useNavigation();
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const params = useLocalSearchParams<{
    targetType?: AttachmentTargetType;
    targetId?: string;
  }>();

  const targetType = (params.targetType as AttachmentTargetType) ?? 'item';
  const targetId = params.targetId;

  const {
    selectFromDevice,
    capturePhoto,
    savePendingAttachment,
    pendingMetadata,
    hasPending,
  } = useAttachmentUpload(targetType, targetId);
  const saveHandlerRef = useRef<() => Promise<void>>(async () => {});

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: false,
    hasChanges: hasPending,
    onSave: () => {
      void saveHandlerRef.current();
    },
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

  const handleTakePicture = () => {
    void capturePhoto();
  };

  const handleUploadFiles = () => {
    void selectFromDevice();
  };

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

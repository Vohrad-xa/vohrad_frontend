import React, {useEffect, useRef} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {useNavigation, useLocalSearchParams, useRouter} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentAddOptions,
  AttachmentUploadPreviewCard,
  AttachmentDestinationCard,
} from '@/features/attachments';
import {useAttachmentUpload} from '@/features/attachments/hooks';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import type {AttachmentTargetType} from '@sykamore/store';

export default function VaultAddScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const params = useLocalSearchParams<{
    targetType?: AttachmentTargetType;
    targetId?: string;
    itemName?: string;
  }>();

  const targetType = (params.targetType ?? undefined) as
    | AttachmentTargetType
    | undefined;
  const targetId = params.targetId ?? undefined;
  const itemName = params.itemName ?? undefined;

  const {
    selectFromDevice,
    selectFromGallery,
    capturePhoto,
    savePendingAttachment,
    resetPending,
    updatePendingName,
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
        router.setParams({
          targetType: undefined,
          targetId: undefined,
          itemName: undefined,
        });
      }
    };
  }, [savePendingAttachment, triggerSuccess, router]);

  useEffect(() => {
    if (!targetType || !targetId) {
      resetPending();
    }
  }, [targetType, targetId, resetPending]);

  const handleTakePicture = () => {
    void capturePhoto();
  };

  const handleChooseFromGallery = () => {
    void selectFromGallery();
  };

  const handleUploadFiles = () => {
    void selectFromDevice();
  };

  const handleClearDestination = () => {
    router.setParams({
      targetType: undefined,
      targetId: undefined,
      itemName: undefined,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <AttachmentDestinationCard
        targetName={itemName}
        targetType={targetType}
        targetId={targetId}
        onClear={handleClearDestination}
      />
      {targetType && targetId && (
        <>
          <AttachmentAddOptions
            onTakePicture={handleTakePicture}
            onChooseFromGallery={handleChooseFromGallery}
            onUploadFiles={handleUploadFiles}
          />
          {pendingMetadata && (
            <AttachmentUploadPreviewCard
              name={pendingMetadata.name}
              mimeType={pendingMetadata.mimeType}
              size={pendingMetadata.size}
              uri={pendingMetadata.uri}
              onNameChange={updatePendingName}
              onClear={resetPending}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        gap: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

import React, {useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useLocalSearchParams} from 'expo-router';
import {RefreshableScrollView} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {
  AttachmentAddOptions,
  AttachmentUploadPreviewCard,
  AttachmentDestinationCard,
} from '@/features/attachments';
import {useAttachmentUpload} from '@/features/attachments/hooks';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import type {AttachmentTargetType} from '@vohrad/store';

export default function VaultAddScreen() {
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
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.contentContainer}>
        {!targetId && <AttachmentDestinationCard />}
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
    </RefreshableScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      contentContainer: {
        flex: 1,
        padding: ds.spacing.lg,
        gap: ds.spacing.lg,
      },
    }),
  (ds, theme) => `${ds.version}-${theme.background}`,
);

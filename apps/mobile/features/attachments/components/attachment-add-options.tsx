import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

interface AttachmentAddOptionsProps {
  onTakePicture?: () => void;
  onChooseFromGallery?: () => void;
  onUploadFiles?: () => void;
}

export function AttachmentAddOptions({
  onTakePicture,
  onChooseFromGallery,
  onUploadFiles,
}: AttachmentAddOptionsProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.wrapper}>
      <Card>
        <Card.Row
          icon="camera-outline"
          onPress={onTakePicture}
          accessibilityLabel="Take picture"
        >
          <ThemedText variant="label">Take picture</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="image-outline"
          onPress={onChooseFromGallery}
          accessibilityLabel="Choose from gallery"
        >
          <ThemedText variant="label">Choose from gallery</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="cloud-upload-outline"
          onPress={onUploadFiles}
          accessibilityLabel="Upload from device"
        >
          <ThemedText variant="label">Upload from device</ThemedText>
        </Card.Row>
      </Card>
      <ThemedText variant="caption" style={styles.helperText}>
        Capture a new photo, choose from gallery, or upload files from your
        device. Supported formats include images, documents, and archives.
      </ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      wrapper: {
        width: '100%',
      },
      helperText: {
        marginTop: ds.spacing.sm,
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

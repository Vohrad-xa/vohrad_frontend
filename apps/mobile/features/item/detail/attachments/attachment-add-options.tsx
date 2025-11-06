import React from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

interface AttachmentAddOptionsProps {
  onTakePicture?: () => void;
  onUploadFiles?: () => void;
}

export function AttachmentAddOptions({
  onTakePicture,
  onUploadFiles,
}: AttachmentAddOptionsProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <View style={styles.container}>
      <Card>
        <Pressable style={styles.option} onPress={onTakePicture}>
          <Icon name="camera-outline" size="xl" colorToken="tint" />
          <ThemedText variant="label">Take Picture</ThemedText>
        </Pressable>
      </Card>

      <Card>
        <Pressable style={styles.option} onPress={onUploadFiles}>
          <Icon name="cloud-upload-outline" size="xl" colorToken="tint" />
          <ThemedText variant="label">Upload Files</ThemedText>
        </Pressable>
      </Card>
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.md,
      },
      option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
    }),
  (ds, theme) => `${ds.version}-${theme.background}`,
);

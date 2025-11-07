import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

interface AttachmentAddOptionsProps {
  onTakePicture?: () => void;
  onUploadFiles?: () => void;
}

export function AttachmentAddOptions({
  onTakePicture,
  onUploadFiles,
}: AttachmentAddOptionsProps) {
  return (
    <View>
      <Card withDivider>
        <AttachmentOptionRow
          icon="camera-outline"
          label="Take picture"
          onPress={onTakePicture}
        />
        <AttachmentOptionRow
          icon="cloud-upload-outline"
          label="Upload from device"
          onPress={onUploadFiles}
        />
      </Card>
    </View>
  );
}

type AttachmentOptionRowProps = {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  onPress?: () => void;
};

function AttachmentOptionRow({icon, label, onPress}: AttachmentOptionRowProps) {
  const {ds, theme} = useTheme();
  const styles = useOptionStyles(ds, theme);

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ThemedText variant="label">{label}</ThemedText>
    </Pressable>
  );
}

const useOptionStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

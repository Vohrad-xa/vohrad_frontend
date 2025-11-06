import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {Divider, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
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
  return (
    <Card>
      <AttachmentOptionRow
        icon="camera-outline"
        label="Take picture"
        onPress={onTakePicture}
      />
      <Divider />
      <AttachmentOptionRow
        icon="cloud-upload-outline"
        label="Upload from device"
        onPress={onUploadFiles}
      />
    </Card>
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
      <View style={styles.iconWrapper}>
        <Icon name={icon} size="lg" colorToken="accentBlue" />
      </View>
      <ThemedText variant="label">{label}</ThemedText>
      <Icon name="chevron-forward-outline" colorToken="muted" />
    </Pressable>
  );
}

const useOptionStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ds.spacing.lg,
        paddingHorizontal: ds.spacing.lg,
        minHeight: ds.components.tapTarget.minSize,
      },
      iconWrapper: {
        marginRight: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

import React, {useState} from 'react';
import {View, StyleSheet, Pressable, TextInput} from 'react-native';
import {Image} from 'expo-image';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {Icon, AppIcons} from '@/utils/icons';

type AttachmentUploadPreviewCardProps = {
  name: string;
  mimeType?: string;
  size?: number;
  uri?: string;
  onNameChange?: (newName: string) => void;
  onClear?: () => void;
};

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return undefined;
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = size >= 100 ? Math.round(size).toString() : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}

export function AttachmentUploadPreviewCard({
  name,
  mimeType,
  size,
  uri,
  onNameChange,
  onClear,
}: AttachmentUploadPreviewCardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const [localName, setLocalName] = useState(name);
  const formattedSize = formatFileSize(size);
  const secondaryLabel = [mimeType, formattedSize].filter(Boolean).join(' • ');
  const isImage = mimeType?.startsWith('image/');

  const handleNameChange = (newName: string) => {
    setLocalName(newName);
    onNameChange?.(newName);
  };

  return (
    <View style={styles.wrapper}>
      <Card>
        <View style={styles.container}>
          {isImage && uri ? (
            <Image
              source={{uri}}
              style={styles.imagePreview}
              contentFit="cover"
            />
          ) : (
            <View style={styles.iconWrapper}>
              <Icon
                name={AppIcons.files.document}
                size="md"
                color={theme.secondary}
              />
            </View>
          )}
          <View style={styles.content}>
            <TextInput
              value={localName}
              onChangeText={handleNameChange}
              style={styles.nameInput}
              placeholder="File name"
              placeholderTextColor={theme.muted}
            />
            {secondaryLabel && (
              <ThemedText variant="caption" style={styles.secondaryText}>
                {secondaryLabel}
              </ThemedText>
            )}
          </View>
          {onClear && (
            <Pressable
              onPress={onClear}
              style={styles.clearButton}
              accessibilityLabel="Clear attachment"
              accessibilityRole="button"
            >
              <Icon name={AppIcons.ui.close} size="md" color={theme.muted} />
            </Pressable>
          )}
        </View>
      </Card>
      <ThemedText variant="caption" style={styles.helperText}>
        You can edit the file name above. Click the X to remove this file and
        choose a different one.
      </ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      wrapper: {
        width: '100%',
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconWrapper: {
        width: 28,
        height: 28,
        marginRight: ds.spacing.lg,
        backgroundColor: theme.card,
        borderRadius: ds.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
      },
      imagePreview: {
        width: 60,
        height: 60,
        marginRight: ds.spacing.lg,
        borderRadius: ds.spacing.md,
        backgroundColor: theme.card,
      },
      content: {
        flex: 1,
      },
      nameInput: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.text,
        padding: 0,
        margin: 0,
      },
      secondaryText: {
        marginTop: ds.spacing.xs,
      },
      clearButton: {
        padding: ds.spacing.sm,
        marginLeft: ds.spacing.sm,
      },
      helperText: {
        marginTop: ds.spacing.sm,
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

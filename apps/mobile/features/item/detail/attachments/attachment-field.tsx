import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {computeAttachmentCounts} from './use-item-attachments';
import type {ItemAttachment} from '@vohrad/types';

interface AttachmentFieldProps {
  itemId?: string;
  attachments?: ItemAttachment[] | null;
}

export function AttachmentField({
  itemId,
  attachments,
}: AttachmentFieldProps): React.JSX.Element {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );
  const attachmentCount = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  const handlePress = () => {
    router.push({
      pathname: '/items/attachments',
      params: {id: itemId},
    });
  };

  return (
    <Pressable
      style={styles.fieldRow}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="View attachments"
    >
      <ThemedText variant="label" style={styles.fieldLabel}>
        Attachments
      </ThemedText>
      <View style={styles.valueContainer}>
        <ThemedText variant="value">
          {attachmentCount} {attachmentCount === 1 ? 'file' : 'files'}
        </ThemedText>
        <Icon name="chevron-forward-outline" size="md" colorToken="muted" />
      </View>
    </Pressable>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flex: 1,
      },
      valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

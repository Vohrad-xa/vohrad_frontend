import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

interface AttachmentFieldProps {
  itemId?: string;
}

export function AttachmentField({
  itemId,
}: AttachmentFieldProps): React.JSX.Element {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handlePress = () => {
    router.push({
      pathname: '/attachments',
      params: {targetType: 'item', targetId: itemId},
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
      <Icon name="chevron-forward-outline" size="md" colorToken="muted" />
    </Pressable>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

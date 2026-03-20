import React, {useCallback} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface DescriptionFieldProps {
  value?: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
}

export function DescriptionField({
  value,
  isEditing,
  onChange,
}: DescriptionFieldProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const handleChange = useCallback(
    (text: string) => {
      onChange?.(text);
    },
    [onChange],
  );

  const displayValue = value?.trim() ?? '';
  const hasContent = displayValue.length > 0;

  return (
    <Card>
      <View style={styles.container}>
        <ThemedText variant="label">Description</ThemedText>
        {isEditing ? (
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            textAlign="left"
            value={value ?? ''}
            onChangeText={handleChange}
            placeholder="Add description"
            placeholderTextColor={theme.inputPlaceholder}
            selectionColor={theme.tint}
            underlineColorAndroid="transparent"
          />
        ) : (
          <ThemedText variant="callout" style={[styles.placeholder]}>
            {hasContent ? displayValue : 'No description provided'}
          </ThemedText>
        )}
      </View>
    </Card>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.sm,
      },
      input: {
        minHeight: ds.spacing.xxl * 2,
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.sm,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: ds.borderRadius.lg,
        backgroundColor: theme.background,
        color: theme.text,
        fontSize: ds.components.input.fontSize,
        textAlignVertical: 'top',
      },
      placeholder: {
        color: theme.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

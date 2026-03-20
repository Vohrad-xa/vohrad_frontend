import React, {useState, useEffect} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface BasicInfoProps {
  name?: string;
  sku?: string;
  onFieldChange?: (field: 'name' | 'sku', value: string) => void;
  isEditing: boolean;
}

export function BasicInfo({
  name,
  sku,
  onFieldChange,
  isEditing,
}: BasicInfoProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    setEditingField(isEditing ? 'name' : null);
  }, [isEditing]);

  const handlePress = (field: string) => {
    if (isEditing) {
      setEditingField(field);
    }
  };

  const fields: Array<{
    label: string;
    value?: string;
    field: 'name' | 'sku';
    placeholder: string;
  }> = [
    {
      label: 'Name',
      value: name,
      field: 'name',
      placeholder: 'Item name',
    },
    {
      label: 'SKU',
      value: sku,
      field: 'sku',
      placeholder: 'Item SKU',
    },
  ];

  return (
    <Card>
      {fields.map(({label, value, field, placeholder}, index) => (
        <React.Fragment key={field}>
          <View style={styles.fieldRow}>
            <ThemedText variant="label" style={styles.fieldLabel}>
              {label}
            </ThemedText>
            <Pressable
              style={styles.inputContainer}
              onPress={() => handlePress(field)}
              disabled={editingField === field || !isEditing}
            >
              {editingField === field ? (
                <TextInput
                  style={styles.input}
                  value={value ?? ''}
                  autoFocus
                  textAlign="right"
                  onBlur={() => setEditingField(null)}
                  onChangeText={(nextValue: string) =>
                    onFieldChange?.(field, nextValue)
                  }
                  placeholder={placeholder}
                  placeholderTextColor={theme.inputPlaceholder}
                  selectionColor={theme.tint}
                  underlineColorAndroid="transparent"
                />
              ) : (
                <ThemedText
                  variant="value"
                  style={styles.displayText}
                  numberOfLines={1}
                >
                  {(value ?? '') ? value : placeholder}
                </ThemedText>
              )}
            </Pressable>
          </View>
          {index < fields.length - 1 && <Card.Divider />}
        </React.Fragment>
      ))}
    </Card>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      fieldLabel: {
        marginRight: ds.spacing.xxl,
      },
      inputContainer: {
        flex: 1,
      },
      input: {
        minHeight: ds.components.input.height,
        paddingHorizontal: 0,
        paddingVertical: 0,
        color: theme.text,
        fontSize: ds.components.input.fontSize,
      },
      displayText: {
        textAlign: 'right',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

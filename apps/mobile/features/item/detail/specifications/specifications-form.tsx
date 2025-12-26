import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import type {TextInput} from 'react-native';
import {Pressable, StyleSheet, View} from 'react-native';
import {useUpdateItem} from '@sykamore/store';
import {ThemedText, ThemedInput, Card} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {showAlert} from '@/utils/alert';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import type {ItemDetail} from '@sykamore/types';

interface SpecificationsFormProps {
  item: ItemDetail;
  onSave?: () => void;
  onHasChangesChange?: (hasChanges: boolean) => void;
  isEditMode: boolean;
}

export interface SpecificationsFormRef {
  performSave: () => Promise<void>;
}

interface SpecField {
  id: string;
  label: string;
  value: string;
}

export const SpecificationsForm = forwardRef<
  SpecificationsFormRef,
  SpecificationsFormProps
>(({item, onSave, onHasChangesChange, isEditMode}, ref) => {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const {mutateAsync: updateItem} = useUpdateItem();
  const styles = createStyles(ds, theme);

  // Parse specifications into editable fields with unique IDs
  const [fields, setFields] = useState<SpecField[]>(() => {
    if (!item.specifications || Object.keys(item.specifications).length === 0) {
      return [];
    }
    return Object.entries(item.specifications).map(([key, value], index) => ({
      id: `${key}-${index}`,
      label: key,
      value: String(value ?? ''),
    }));
  });

  const originalFields = useRef<SpecField[]>(fields);
  const nextIdRef = useRef(fields.length);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const handleLabelChange = useCallback((id: string, label: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? {...field, label} : field)),
    );
  }, []);

  const handleValueChange = useCallback((id: string, value: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? {...field, value} : field)),
    );
  }, []);

  const handleAddField = useCallback(() => {
    const newField: SpecField = {
      id: `new-${nextIdRef.current++}`,
      label: '',
      value: '',
    };
    setFields((prev) => [...prev, newField]);

    setTimeout(() => {
      inputRefs.current[newField.id]?.focus();
    }, 100);
  }, []);

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  }, []);

  const checkForChanges = useCallback(() => {
    if (fields.length !== originalFields.current.length) {
      return true;
    }
    return JSON.stringify(fields) !== JSON.stringify(originalFields.current);
  }, [fields]);

  // Notify parent of changes
  useEffect(() => {
    onHasChangesChange?.(checkForChanges());
  }, [checkForChanges, onHasChangesChange]);

  // Save specifications
  const performSave = useCallback(async (): Promise<void> => {
    if (!checkForChanges()) {
      return;
    }

    // Check for duplicate labels
    const labels = fields
      .map((f) => f.label.trim().toLowerCase())
      .filter((label) => label !== '');

    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      showAlert({
        title: 'Error',
        message: 'Duplicate specification keys are not allowed',
      });

      // Focus back on the last field
      setTimeout(() => {
        const lastField = fields[fields.length - 1];
        if (lastField) {
          inputRefs.current[lastField.id]?.focus();
        }
      }, 100);

      throw new Error('Duplicate specification keys are not allowed');
    }

    const specifications: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.label.trim()) {
        specifications[field.label.trim()] = field.value;
      }
    });

    try {
      await updateItem({id: item.id, data: {specifications}});
      originalFields.current = [...fields];
      onHasChangesChange?.(false);
      triggerHaptic('success');
      onSave?.();
    } catch (err) {
      throw err;
    }
  }, [
    item.id,
    fields,
    updateItem,
    onHasChangesChange,
    triggerHaptic,
    onSave,
    checkForChanges,
  ]);

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    performSave,
  }));

  return (
    <View style={{gap: ds.spacing.lg}}>
      {fields.length > 0 && (
        <Card>
          {fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <View style={styles.row}>
                {isEditMode && (
                  <Pressable
                    onPress={() => handleRemoveField(field.id)}
                    style={styles.minusButton}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  >
                    <View style={styles.minusCircle}>
                      <Icon
                        name="remove-outline"
                        size="sm"
                        colorToken="destructive"
                      />
                    </View>
                  </Pressable>
                )}

                <View
                  style={[
                    styles.inputsContainer,
                    isEditMode && styles.inputsContainerWithMinus,
                  ]}
                >
                  <ThemedInput
                    ref={(ref) => {
                      if (ref) inputRefs.current[field.id] = ref;
                    }}
                    variant="label"
                    textAlign="left"
                    borderless
                    value={field.label}
                    onChangeText={(text) => handleLabelChange(field.id, text)}
                    placeholder="label"
                    editable={isEditMode}
                    // style={styles.labelInput}
                  />

                  <ThemedInput
                    variant="value"
                    textAlign="right"
                    borderless
                    value={field.value}
                    onChangeText={(text) => handleValueChange(field.id, text)}
                    placeholder="value"
                    editable={isEditMode}
                    style={styles.valueInput}
                  />
                </View>
              </View>
              {index < fields.length - 1 && <Card.Divider />}
            </React.Fragment>
          ))}
        </Card>
      )}

      {isEditMode && (
        <View style={styles.addFieldRow}>
          <Pressable
            onPress={handleAddField}
            style={styles.addButton}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          >
            <Icon
              name="add-circle-outline"
              size="md"
              colorToken="accentDeepblue"
            />
          </Pressable>
          <Pressable onPress={handleAddField} style={styles.addTextButton}>
            <ThemedText variant="label">add new field</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
});

SpecificationsForm.displayName = 'SpecificationsForm';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      minusButton: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      minusCircle: {
        width: ds.iconSize.md,
        height: ds.iconSize.md,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.destructive,
        justifyContent: 'center',
        alignItems: 'center',
      },
      inputsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      inputsContainerWithMinus: {
        flex: 1,
      },
      valueInput: {
        flex: 1,
        minWidth: 0,
      },
      addFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
        paddingLeft: ds.spacing.md,
      },
      addButton: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      addTextButton: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

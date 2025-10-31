import React, {useRef} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {TextInput} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText, ThemedInput} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface BasicInfoProps {
  name?: string;
  code?: string;
  serialNumber?: string;
  onFieldChange?: (
    field: 'name' | 'code' | 'serial_number',
    value: string,
  ) => void;
}

export function BasicInfo({
  name,
  code,
  serialNumber,
  onFieldChange,
}: BasicInfoProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  // Create refs for inputs
  const nameInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const serialNumberInputRef = useRef<TextInput>(null);

  return (
    <Card withDivider>
      <Pressable onPress={() => nameInputRef.current?.focus()}>
        <View style={styles.fieldRow}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            Name
          </ThemedText>
          <View style={styles.inputContainer}>
            <ThemedInput
              ref={nameInputRef}
              variant="label"
              textAlign="right"
              borderless
              value={name ?? ''}
              onChangeText={(value) => onFieldChange?.('name', value)}
              placeholder="Item name"
              style={styles.input}
              numberOfLines={1}
            />
          </View>
        </View>
      </Pressable>

      <Pressable onPress={() => codeInputRef.current?.focus()}>
        <View style={styles.fieldRow}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            Code
          </ThemedText>
          <View style={styles.inputContainer}>
            <ThemedInput
              ref={codeInputRef}
              variant="label"
              textAlign="right"
              borderless
              value={code ?? ''}
              onChangeText={(value) => onFieldChange?.('code', value)}
              placeholder="Item code"
              style={styles.input}
              numberOfLines={1}
            />
          </View>
        </View>
      </Pressable>

      <Pressable onPress={() => serialNumberInputRef.current?.focus()}>
        <View style={styles.fieldRow}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            Serial Number
          </ThemedText>
          <View style={styles.inputContainer}>
            <ThemedInput
              ref={serialNumberInputRef}
              variant="label"
              textAlign="right"
              borderless
              value={serialNumber ?? ''}
              onChangeText={(value) => onFieldChange?.('serial_number', value)}
              placeholder="Serial number"
              style={styles.input}
              numberOfLines={1}
            />
          </View>
        </View>
      </Pressable>
    </Card>
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
        flexShrink: 0,
        marginRight: ds.spacing.md,
      },
      inputContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 0,
      },
      input: {
        width: '100%',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

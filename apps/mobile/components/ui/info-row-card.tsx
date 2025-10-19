import React, {useEffect, useRef} from 'react';
import type {TextInput} from 'react-native';
import {StyleSheet, View, Platform} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from './divider';
import {InfoRow} from './info-row';

type InfoField = {
  key: string;
  label: string;
  value?: string | null;
  placeholder?: string;
  type?: 'text' | 'date';
};

type InfoRowCardProps = {
  fields: InfoField[];
  editable?: boolean;
  values?: Record<string, string>;
  onFieldChange?: (key: string, value: string) => void;
  autoFocus?: boolean;
};

export const InfoRowCard: React.FC<InfoRowCardProps> = ({
  fields,
  editable = false,
  values = {},
  onFieldChange,
  autoFocus = false,
}) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const inputRefs = useRef<Map<string, React.RefObject<TextInput | null>>>(
    new Map(),
  );
  const firstInputRef = useRef<TextInput | null>(null);

  // Create refs for all fields
  fields.forEach((field) => {
    if (!inputRefs.current.has(field.key)) {
      inputRefs.current.set(
        field.key,
        field === fields[0] ? firstInputRef : React.createRef<TextInput>(),
      );
    }
  });

  useEffect(() => {
    if (editable && autoFocus && fields.length > 0) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [editable, autoFocus, fields.length]);

  return (
    <View style={styles.card}>
      {fields.map((field, index) => {
        const displayValue = editable
          ? (values[field.key] ?? field.value)
          : field.value;
        const inputRef = inputRefs.current.get(field.key);

        return (
          <React.Fragment key={field.key}>
            {index > 0 && (
              <View style={styles.separatorContainer}>
                <Divider style={styles.separator} />
              </View>
            )}
            <View style={styles.rowContainer}>
              <InfoRow
                label={field.label}
                value={displayValue}
                editable={editable}
                onChangeText={(text) => onFieldChange?.(field.key, text)}
                placeholder={field.placeholder}
                inputRef={inputRef}
                type={field.type}
              />
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {
        borderRadius: ds.components.card.borderRadius,
        backgroundColor: theme.input,
        // ...ds.shadows.sm,
      },
      rowContainer: {
        paddingVertical:
          Platform.OS === 'android' ? ds.spacing.xs : ds.spacing.lg,
        paddingHorizontal: ds.spacing.md,
        justifyContent: 'center',
      },
      separatorContainer: {
        paddingHorizontal: ds.spacing.md,
      },
      separator: {
        marginVertical: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

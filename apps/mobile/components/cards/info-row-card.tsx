import React, {useEffect, useRef} from 'react';
import type {TextInput, TextInputProps} from 'react-native';
import {StyleSheet, View, Platform} from 'react-native';
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import type {IconName} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from 'react-native-paper';
import {InfoRow} from './info-row';

export type InfoField = {
  key: string;
  label: string;
  value?: string | null;
  placeholder?: string;
  type?: 'text' | 'date' | 'time';
  span?: 'half' | 'full';
  keyboardType?: TextInputProps['keyboardType'];
  renderAccessory?: React.ReactNode;
  icon?: IconName;
  iconSize?: number;
  iconColorToken?: TokenName;
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
  const cardStyles = usePlatformStyles({
    mobile: styles.card,
    web: styles.cardWeb,
  });
  const rowContainerStyles = usePlatformStyles({
    mobile: styles.rowContainer,
    web: styles.rowContainerWeb,
  });
  const cardContentStyles = usePlatformStyles({
    mobile: styles.cardContent,
    web: styles.cardContentWeb,
  });
  const isEditable = editable || Platform.OS === 'web';
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
    if (isEditable && autoFocus && fields.length > 0) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isEditable, autoFocus, fields.length]);

  const renderField = (field: InfoField) => {
    const displayValue = isEditable
      ? (values[field.key] ?? field.value)
      : field.value;
    const inputRef = inputRefs.current.get(field.key);

    return (
      <InfoRow
        label={field.label}
        value={displayValue}
        editable={isEditable}
        onChangeText={(text) => onFieldChange?.(field.key, text)}
        placeholder={field.placeholder}
        inputRef={inputRef}
        type={field.type}
        keyboardType={field.keyboardType}
        renderAccessory={field.renderAccessory}
        icon={field.icon}
        iconSize={field.iconSize}
        iconColorToken={field.iconColorToken}
      />
    );
  };

  const renderFields = () => {
    if (Platform.OS === 'web') {
      const rows: InfoField[][] = [];
      let currentRow: InfoField[] = [];

      fields.forEach((field) => {
        if (field.span === 'full' || !field.span) {
          if (currentRow.length > 0) {
            rows.push(currentRow);
            currentRow = [];
          }
          rows.push([field]);
        } else if (field.span === 'half') {
          currentRow.push(field);
          if (currentRow.length === 2) {
            rows.push(currentRow);
            currentRow = [];
          }
        }
      });

      if (currentRow.length > 0) {
        rows.push(currentRow);
      }

      return rows.map((row, rowIndex) => {
        const hasDateField = row.some((field) => field.type === 'date');
        const fieldRowStyle = hasDateField
          ? [styles.fieldRow, styles.fieldRowWithDate]
          : styles.fieldRow;

        return (
          <View key={rowIndex} style={fieldRowStyle}>
            {row.map((field) => (
              <View key={field.key} style={rowContainerStyles}>
                {renderField(field)}
              </View>
            ))}
          </View>
        );
      });
    }

    return fields.map((field, index) => (
      <React.Fragment key={field.key}>
        {index > 0 && (
          <View
            style={[
              styles.separatorContainer,
              {
                paddingLeft: field.icon
                  ? (field.iconSize ?? 20) + ds.spacing.xl + ds.spacing.xl
                  : ds.spacing.xl,
              },
            ]}
          >
            <Divider style={styles.separator} />
          </View>
        )}
        <View style={rowContainerStyles}>{renderField(field)}</View>
      </React.Fragment>
    ));
  };

  const hasDateOrTimePicker =
    Platform.OS === 'web' &&
    fields.some((field) => field.type === 'date' || field.type === 'time');

  const cardContainerStyle = hasDateOrTimePicker
    ? [cardStyles, {position: 'relative' as const, zIndex: 100}]
    : cardStyles;

  return (
    <View style={cardContainerStyle}>
      <View style={cardContentStyles}>{renderFields()}</View>
    </View>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {
        borderRadius: ds.components.card.borderRadius,
        backgroundColor: theme.input,
      },
      cardWeb: {
        borderRadius: ds.borderRadius.lg,
        backgroundColor: 'transparent',
      },
      cardContent: {},
      cardContentWeb: {
        flexDirection: 'column',
        gap: ds.spacing.lg,
      },
      fieldRow: {
        flexDirection: 'row',
        gap: ds.spacing.md,
        width: '100%',
      },
      fieldRowWithDate: {
        position: 'relative',
        zIndex: 100,
      },
      rowContainer: {
        paddingVertical: Platform.OS === 'android' ? 6 : ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
        justifyContent: 'center',
      },
      rowContainerWeb: {
        flex: 1,
        paddingVertical: 0,
        paddingHorizontal: 0,
        justifyContent: 'center',
      },
      separatorContainer: {
        paddingHorizontal: ds.spacing.xl,
      },
      separator: {
        marginVertical: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

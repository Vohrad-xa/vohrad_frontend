import React, {forwardRef, useImperativeHandle, useState, useMemo} from 'react';
import {StyleSheet, View, Platform, Pressable} from 'react-native';
import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useCreateUser} from '@vohrad/store';
import {Card} from '@/components/cards/card';
import {
  ThemedInput,
  ThemedText,
  DatePickerMobile,
  DatePickerWeb,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {formatDateInput, parseDateInput, showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {UserCreateData} from '@vohrad/types';

export type AddUserScreenHandle = {
  saveUser: () => Promise<boolean>;
  hasChanges: () => boolean;
};

type AddUserScreenProps = {
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};

export const AddUserScreen = forwardRef<
  AddUserScreenHandle,
  AddUserScreenProps
>(({onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme);
  const {mutateAsync: createUser} = useCreateUser();
  const [formData, setFormData] = useState<Partial<UserCreateData>>({});
  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev: Partial<UserCreateData>) => ({...prev, [key]: value}));
    onFieldChange?.();
  };

  const hasChanges = () => {
    return Object.keys(formData).length > 0;
  };

  const selectedDate = useMemo(
    () => parseDateInput(formData.date_of_birth),
    [formData.date_of_birth],
  );

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      handleFieldChange('date_of_birth', formatDateInput(date));
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        onChange: handleDateChange,
        mode: 'date',
        maximumDate: new Date(),
      });
    }
  };

  const saveUser = async (): Promise<boolean> => {
    if (!formData.email || !formData.password) {
      showAlert({
        title: 'Missing Required Fields',
        message: 'Email and password are required to create a user.',
      });
      return false;
    }

    try {
      const cleanedData: Partial<UserCreateData> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value !== null && value !== undefined && value !== '') {
          cleanedData[key as keyof UserCreateData] = value as never;
        }
      }

      await createUser(cleanedData as UserCreateData);
      onSaveComplete?.();
      return true;
    } catch {
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    saveUser,
    hasChanges,
  }));

  const fields: Array<{
    label: string;
    key: keyof UserCreateData;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    type?: 'text' | 'date';
  }> = [
    {
      label: 'First Name',
      key: 'first_name',
      placeholder: 'Required',
    },
    {
      label: 'Last Name',
      key: 'last_name',
      placeholder: 'Required',
    },
    {
      label: 'Email',
      key: 'email',
      placeholder: 'Required',
      keyboardType: 'email-address',
    },
    {
      label: 'Password',
      key: 'password',
      placeholder: 'Required',
      secureTextEntry: true,
    },
    {
      label: 'Date of Birth',
      key: 'date_of_birth',
      placeholder: 'Optional',
      type: 'date',
    },
    {
      label: 'Phone',
      key: 'phone_number',
      placeholder: 'Optional',
      keyboardType: 'phone-pad',
    },

    {
      label: 'Address',
      key: 'address',
      placeholder: 'Optional',
    },
    {
      label: 'City',
      key: 'city',
      placeholder: 'Optional',
    },
    {
      label: 'Province',
      key: 'province',
      placeholder: 'Optional',
    },
    {
      label: 'Postal Code',
      key: 'postal_code',
      placeholder: 'Optional',
    },
    {
      label: 'Country',
      key: 'country',
      placeholder: 'Optional',
    },
  ];

  const renderField = (
    field: {
      label: string;
      key: keyof UserCreateData;
      placeholder: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      secureTextEntry?: boolean;
      type?: 'text' | 'date';
    },
    index: number,
  ) => {
    const {label, key, placeholder, keyboardType, secureTextEntry, type} =
      field;
    const displayValue = (formData[key] as string) ?? '';

    // iOS Date Picker
    if (type === 'date' && Platform.OS === 'ios') {
      return (
        <DatePickerMobile
          label={label}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          editable
          displayValue={displayValue}
          fallbackLabel={placeholder}
          scheme={scheme}
          styles={styles}
        />
      );
    }

    // Web Date Picker
    if (type === 'date' && Platform.OS === 'web') {
      return (
        <View style={styles.fieldRow}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            {label}
          </ThemedText>
          <View style={styles.inputContainer}>
            <DatePickerWeb
              mode="date"
              selectedDate={selectedDate}
              onDateChange={(date) => {
                handleFieldChange(key, formatDateInput(date));
              }}
              placeholder={placeholder}
              disabled={false}
              inputStyle={styles.datePickerInput}
              theme={theme}
              scheme={scheme}
              ds={ds}
            />
          </View>
        </View>
      );
    }

    // Android Date Picker
    if (type === 'date' && Platform.OS === 'android') {
      return (
        <Pressable onPress={openDatePicker} style={styles.fieldRow}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            {label}
          </ThemedText>
          <View style={styles.inputContainer}>
            <ThemedInput
              variant="value"
              textAlign="left"
              borderless
              value={displayValue}
              placeholder={placeholder}
              editable={false}
              pointerEvents="none"
            />
          </View>
        </Pressable>
      );
    }

    // Regular text input
    return (
      <View style={styles.fieldRow}>
        <ThemedText variant="label" style={styles.fieldLabel}>
          {label}
        </ThemedText>
        <View style={styles.inputContainer}>
          <ThemedInput
            variant="value"
            textAlign="left"
            value={displayValue}
            onChangeText={(val) => handleFieldChange(key, val)}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoFocus={index === 0}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Card>
        {fields.map((field, index) => (
          <React.Fragment key={field.key}>
            {renderField(field, index)}
            {index < fields.length - 1 && <Card.Divider />}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
});

AddUserScreen.displayName = 'AddUserScreen';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.md,
      },
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      fieldLabel: {
        marginRight: ds.spacing.xxl,
        minWidth: '35%',
      },
      inputContainer: {
        flex: 1,
      },
      datePickerInput: {
        ...ds.typography.value,
        flexShrink: 1,
        textAlign: 'left',
        color: theme.text,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md * 2,
        justifyContent: 'flex-start',
      },
      valueText: {},
      iosDatePicker: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginVertical: -ds.spacing.md,
        transform: [{scale: 0.9}],
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

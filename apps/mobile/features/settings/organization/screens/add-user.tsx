import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {useCreateUser} from '@sykamore/store';
import {TextInput, List} from 'react-native-paper';

import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {DatePicker} from '@/modules/sykamore-ui/src/android';
import {useTheme} from '@/providers';
import {showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {RolePicker} from '../components';
import type {UserCreateData} from '@sykamore/types';

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
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {mutateAsync: createUser} = useCreateUser();
  const [formData, setFormData] = useState<Partial<UserCreateData>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFieldChange = (key: string, value: string | Date | undefined) => {
    setFormData((prev: Partial<UserCreateData>) => ({
      ...prev,
      [key]: value instanceof Date ? value.toISOString().split('T')[0] : value,
    }));
    onFieldChange?.();
  };

  const handleRoleSelect = (roleId: string) => {
    handleFieldChange('role_id', roleId);
  };

  const hasChanges = () => {
    return Object.keys(formData).length > 0;
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

  const textFields: Array<{
    key: keyof UserCreateData;
    label: string;
    keyboardType?: 'email-address' | 'phone-pad';
    autoCapitalize?: 'none';
    secureTextEntry?: boolean;
  }> = [
    {key: 'first_name', label: 'First Name *'},
    {key: 'last_name', label: 'Last Name *'},
    {
      key: 'email',
      label: 'Email *',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
    },
    {key: 'password', label: 'Password *', secureTextEntry: true},
    {key: 'phone_number', label: 'Phone', keyboardType: 'phone-pad'},
    {key: 'address', label: 'Address'},
    {key: 'city', label: 'City'},
    {key: 'province', label: 'Province'},
    {key: 'postal_code', label: 'Postal Code'},
    {key: 'country', label: 'Country'},
  ];

  return (
    <View>
      <List.Section
        title="Role Assignment"
        titleStyle={styles.sectionTitleStyle}
      >
        <List.Item
          style={styles.itemList}
          title="Select role for the new User"
          right={() => (
            <RolePicker
              selectedRoleId={formData.role_id}
              onRoleSelect={handleRoleSelect}
            />
          )}
        />
      </List.Section>
      <List.Section
        title="User Information"
        style={styles.inputGroup}
        titleStyle={{
          ...styles.sectionTitleStyle,
        }}
      >
        {textFields.map((field) => (
          <TextInput
            key={field.key}
            label={field.label}
            value={(formData[field.key] as string) ?? ''}
            onChangeText={(val) => handleFieldChange(field.key, val)}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            secureTextEntry={field.secureTextEntry}
            textColor={theme.text}
            activeOutlineColor={theme.primary}
            outlineStyle={styles.input}
            mode="outlined"
          />
        ))}
        <Pressable onPress={() => setShowDatePicker(true)}>
          <TextInput
            label="Date of Birth"
            value={
              formData.date_of_birth
                ? new Date(formData.date_of_birth).toLocaleDateString()
                : ''
            }
            editable={false}
            activeOutlineColor={theme.primary}
            outlineStyle={styles.input}
            mode="outlined"
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="calendar"
                forceTextInputFocus
                onPress={() => setShowDatePicker(true)}
              />
            }
          />
        </Pressable>
        {showDatePicker && (
          <DatePicker
            initialDate={formData.date_of_birth ?? null}
            onDateSelected={(date) => {
              if (date) {
                handleFieldChange('date_of_birth', date);
              }
              setShowDatePicker(false);
            }}
            onDismiss={() => setShowDatePicker(false)}
            confirmText="OK"
            dismissText="Cancel"
          />
        )}
      </List.Section>
    </View>
  );
});

AddUserScreen.displayName = 'AddUserScreen';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      inputGroup: {
        gap: ds.spacing.sm,
      },
      input: {
        backgroundColor: theme.input,
        borderRadius: ds.components.input.borderRadius,
        borderWidth: 0,
      },
      sectionTitleStyle: {
        ...ds.typography.sectionTitle,
      },
      itemList: {
        paddingRight: 0,
        paddingLeft: 0,
        paddingVertical: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

import React, {forwardRef, useImperativeHandle} from 'react';
import {useRolesList} from '@/features/roles';
import {
  Host,
  List,
  Section,
  TextField,
  SecureField,
  DatePicker,
  Picker,
  Button,
  datePickerStyle,
  Text,
} from '@/modules/sykamore-ui/src/ios';
import {useAddUser} from '../hooks/use-add-user';
import type {Role} from '@sykamore/types';

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
  const {
    formData,
    handleFieldChange,
    handleRoleSelect,
    hasChanges,
    saveUser,
    textFields,
  } = useAddUser(onSaveComplete, onFieldChange);

  const {roles} = useRolesList();
  const activeRoles = roles?.filter((role: Role) => role.is_active) ?? [];

  useImperativeHandle(ref, () => ({
    saveUser,
    hasChanges,
  }));

  return (
    <Host style={{flex: 1}} matchContents>
      <List listStyle="insetGrouped" showScrollIndicators={false}>
        {activeRoles.length > 0 && (
          <Section
            title="Select Role"
            footer={
              <Text>
                The role determines the user&apos;s permissions and access
                levels within the system.
              </Text>
            }
          >
            <Picker
              label="Role"
              selection={formData.role_id}
              onSelectionChange={({nativeEvent}) =>
                handleRoleSelect(String(nativeEvent.selection))
              }
            >
              {activeRoles.map((role) => (
                <Button
                  key={role.id}
                  label={role.name}
                  modifiers={[{$type: 'tag', tag: role.id}]}
                />
              ))}
            </Picker>
          </Section>
        )}

        <Section title="User Information">
          {textFields.map((field) =>
            field.secureTextEntry ? (
              <SecureField
                key={field.key}
                placeholder={field.label}
                defaultValue={(formData[field.key] as string) ?? ''}
                onChangeText={(val) => handleFieldChange(field.key, val)}
              />
            ) : (
              <TextField
                key={field.key}
                placeholder={field.label}
                defaultValue={(formData[field.key] as string) ?? ''}
                onChangeText={(val) => handleFieldChange(field.key, val)}
                textContentType={field.textContentType}
                keyboardType={field.keyboardType}
                autocapitalization={field.autocapitalization}
                submitLabel={field.submitLabel}
              />
            ),
          )}
          <DatePicker
            title="Date of Birth"
            displayedComponents={['date']}
            modifiers={[datePickerStyle('automatic')]}
            selection={
              formData.date_of_birth
                ? new Date(formData.date_of_birth)
                : new Date()
            }
            onDateChange={(date) => handleFieldChange('date_of_birth', date)}
          />
        </Section>
      </List>
    </Host>
  );
});

AddUserScreen.displayName = 'AddUserScreen';

import {useState, useCallback} from 'react';
import {useCreateUser} from '@sykamore/store';
import {showAlert} from '@/utils';
import type {UserCreateData} from '@sykamore/types';

export function useAddUser(
  onSaveComplete?: () => void,
  onFieldChange?: () => void,
) {
  const {mutateAsync: createUser} = useCreateUser();
  const [formData, setFormData] = useState<Partial<UserCreateData>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleFieldChange = useCallback(
    (key: string, value: string | Date | undefined) => {
      setFormData((prev) => ({
        ...prev,
        [key]:
          value instanceof Date ? value.toISOString().split('T')[0] : value,
      }));
      onFieldChange?.();
    },
    [onFieldChange],
  );

  const handleRoleSelect = useCallback(
    (roleId: string) => {
      handleFieldChange('role_id', roleId);
    },
    [handleFieldChange],
  );

  const hasChanges = useCallback(() => {
    return Object.keys(formData).length > 0;
  }, [formData]);

  const saveUser = useCallback(async (): Promise<boolean> => {
    if (!formData.email) {
      showAlert({
        title: 'Missing Required Field',
        message: 'Email is required to create a user.',
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
  }, [formData, createUser, onSaveComplete]);

  const textFields: Array<{
    key: keyof UserCreateData;
    label: string;
    keyboardType?:
      | 'email-address'
      | 'phone-pad'
      | 'default'
      | 'numeric'
      | 'url';
    textContentType?:
      | 'email-address'
      | 'one-time-code'
      | 'username'
      | 'name'
      | 'given-name'
      | 'family-name'
      | 'telephone-number'
      | 'address-city'
      | 'address-state'
      | 'postal-code'
      | 'street-address-line1'
      | 'street-address-line2'
      | 'credit-card-number';
    autoCapitalize?: 'none' | 'words';
    autocapitalization?: 'never' | 'words' | 'sentences';
    submitLabel?: 'next' | 'done';
    secureTextEntry?: boolean;
  }> = [
    {
      key: 'first_name',
      label: 'First Name',
      textContentType: 'given-name',
      autoCapitalize: 'words',
      autocapitalization: 'words',
      submitLabel: 'next',
    },
    {
      key: 'last_name',
      label: 'Last Name',
      textContentType: 'family-name',
      autoCapitalize: 'words',
      autocapitalization: 'words',
      submitLabel: 'next',
    },
    {
      key: 'email',
      label: 'Email *',
      keyboardType: 'email-address',
      textContentType: 'email-address',
      autoCapitalize: 'none',
      autocapitalization: 'never',
      submitLabel: 'next',
    },
    {
      key: 'phone_number',
      label: 'Phone',
      keyboardType: 'phone-pad',
      textContentType: 'telephone-number',
      submitLabel: 'next',
    },
    {
      key: 'address',
      label: 'Address',
      textContentType: 'street-address-line1',
      autocapitalization: 'words',
      submitLabel: 'next',
    },
    {
      key: 'city',
      label: 'City',
      textContentType: 'address-city',
      autocapitalization: 'words',
      submitLabel: 'next',
    },
    {
      key: 'province',
      label: 'Province',
      textContentType: 'address-state',
      autocapitalization: 'words',
      submitLabel: 'next',
    },
    {
      key: 'postal_code',
      label: 'Postal Code',
      textContentType: 'postal-code',
      autocapitalization: 'never',
      submitLabel: 'next',
    },
    {
      key: 'country',
      label: 'Country',
      autocapitalization: 'words',
      submitLabel: 'done',
    },
  ];

  return {
    formData,
    showDatePicker,
    setShowDatePicker,
    handleFieldChange,
    handleRoleSelect,
    hasChanges,
    saveUser,
    textFields,
  };
}

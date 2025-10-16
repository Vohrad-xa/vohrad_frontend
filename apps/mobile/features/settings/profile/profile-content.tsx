import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import type {UserUpdateData} from '@vohrad/types';
import {ThemedButton, Input, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useLoading} from '@/providers';
import {showConfirmAlert, showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {useProfileDetails} from './use-profile-details';
import {useUpdateProfile} from './use-update-profile';

type ProfileRow = {
  key: keyof ProfileFormState;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

type ProfileFormState = Required<{
  [K in keyof UserUpdateData]: string;
}>;

export function ProfileContentEditable() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {showLoading, hideLoading} = useLoading();

  const profileDetails = useProfileDetails();
  const {updateProfile, error, clearError} = useUpdateProfile();

  const [profile, setProfile] = useState<ProfileFormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    if (profileDetails) {
      setProfile({
        first_name: profileDetails.first_name ?? '',
        last_name: profileDetails.last_name ?? '',
        email: profileDetails.email ?? '',
        phone_number: profileDetails.phone_number ?? '',
        date_of_birth: profileDetails.date_of_birth ?? '',
        address: profileDetails.address ?? '',
        city: profileDetails.city ?? '',
        province: profileDetails.province ?? '',
        postal_code: profileDetails.postal_code ?? '',
        country: profileDetails.country ?? '',
      });
    }
  }, [profileDetails]);

  const fields: ProfileRow[] = [
    {key: 'first_name', label: 'First Name', placeholder: 'First Name'},
    {key: 'last_name', label: 'Last Name', placeholder: 'Last Name'},
    {
      key: 'email',
      label: 'Email Address',
      placeholder: 'Email Address',
      keyboardType: 'email-address',
    },
    {
      key: 'phone_number',
      label: 'Phone Number',
      placeholder: 'Phone Number',
      keyboardType: 'phone-pad',
    },
    {key: 'date_of_birth', label: 'Date of Birth', placeholder: 'YYYY-MM-DD'},
    {key: 'address', label: 'Address', placeholder: 'Street Address'},
    {key: 'city', label: 'City', placeholder: 'City'},
    {key: 'province', label: 'Province', placeholder: 'Province/State'},
    {key: 'postal_code', label: 'Postal Code', placeholder: 'Postal Code'},
    {key: 'country', label: 'Country', placeholder: 'Country'},
  ];

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setProfile((prev) => ({...prev, [key]: value}));
  };

  const performUpdate = async () => {
    clearError();
    showLoading('Updating profile...');

    const updateData: UserUpdateData = {
      first_name: profile.first_name.trim() || undefined,
      last_name: profile.last_name.trim() || undefined,
      email: profile.email.trim() || undefined,
      phone_number: profile.phone_number.trim() || undefined,
      date_of_birth: profile.date_of_birth.trim() || undefined,
      address: profile.address.trim() || undefined,
      city: profile.city.trim() || undefined,
      province: profile.province.trim() || undefined,
      postal_code: profile.postal_code.trim() || undefined,
      country: profile.country.trim() || undefined,
    };

    const success = await updateProfile(updateData);

    await new Promise((resolve) => setTimeout(resolve, 500));
    hideLoading();

    if (success) {
      showAlert({
        title: 'Success',
        message: 'Profile updated successfully',
      });
    } else {
      showAlert({
        title: 'Error',
        message: error ?? 'Failed to update profile',
      });
    }
  };

  const handleSaveProfile = () => {
    showConfirmAlert({
      title: 'Update Profile',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm: () => {
        performUpdate();
      },
    });
  };

  return (
    <View style={styles.container}>
      {fields.map((item) => (
        <View key={item.key} style={styles.fieldContainer}>
          <ThemedText variant="label" colorToken="label" style={styles.label}>
            {item.label}
          </ThemedText>
          <Input
            value={profile[item.key]}
            onChangeText={(text) => updateField(item.key, text)}
            placeholder={item.placeholder}
            keyboardType={item.keyboardType}
          />
        </View>
      ))}

      <View style={styles.actions}>
        <ThemedButton
          title="Save Profile"
          variant="primary"
          onPress={handleSaveProfile}
        />
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.lg,
        paddingTop: ds.spacing.md,
      },
      fieldContainer: {
        gap: ds.spacing.sm,
      },
      label: {
        paddingLeft: ds.spacing.sm,
      },
      actions: {
        paddingTop: ds.spacing.md,
        paddingBottom: ds.spacing.xxxl + ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ThemedButton,
  Input,
  ThemedText,
  DatePicker,
  GlassCard,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useLoading} from '@/providers';
import {showConfirmAlert, showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {formatDate} from './format-date';
import {useProfileDetails} from './use-profile-details';
import {useUpdateProfile} from './use-update-profile';
import {useEmailConfirmation} from './use-email-confirmation';
import type {UserUpdateData} from '@vohrad/types';

type ProfileRow = {
  key: keyof ProfileFormState;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

type ProfileFormState = Required<{
  [K in keyof UserUpdateData]: string;
}>;

type ProfileContentEditableProps = {
  showInlineSaveButton?: boolean;
};

export type ProfileContentHandle = {
  saveProfile: () => void;
};

export const ProfileContentEditable = forwardRef<
  ProfileContentHandle,
  ProfileContentEditableProps
>(({showInlineSaveButton = true}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {showLoading, hideLoading} = useLoading();

  const profileDetails = useProfileDetails();
  const {updateProfile, error, clearError} = useUpdateProfile();
  const {resendPendingEmail, isProcessing: isResendingEmail} =
    useEmailConfirmation();

  const emptyProfileState: ProfileFormState = useMemo(
    () => ({
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
    }),
    [],
  );

  const [profile, setProfile] = useState<ProfileFormState>(emptyProfileState);
  const [initialProfile, setInitialProfile] =
    useState<ProfileFormState>(emptyProfileState);

  useEffect(() => {
    if (profileDetails) {
      const nextProfile: ProfileFormState = {
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
      };

      setProfile(nextProfile);
      setInitialProfile(nextProfile);
    } else {
      setProfile(emptyProfileState);
      setInitialProfile(emptyProfileState);
    }
  }, [profileDetails, emptyProfileState]);

  const basicFields: ProfileRow[] = [
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
  ];

  const addressFields: ProfileRow[] = [
    {key: 'address', label: 'Address', placeholder: 'Street Address'},
    {key: 'city', label: 'City', placeholder: 'City'},
    {key: 'province', label: 'Province', placeholder: 'Province/State'},
    {key: 'postal_code', label: 'Postal Code', placeholder: 'Postal Code'},
    {key: 'country', label: 'Country', placeholder: 'Country'},
  ];

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setProfile((prev) => ({...prev, [key]: value}));
  };

  const computeUpdateValue = (
    key: keyof ProfileFormState,
  ): string | null | undefined => {
    const currentValue = profile[key].trim();
    const originalValue = initialProfile[key].trim();

    if (currentValue === originalValue) {
      return undefined;
    }

    if (key === 'email' && currentValue.length === 0) {
      return undefined;
    }

    if (currentValue.length === 0) {
      return originalValue.length > 0 ? null : undefined;
    }

    return currentValue;
  };

  const performUpdate = async () => {
    clearError();
    showLoading('Updating profile...');

    const updateData: UserUpdateData = {
      first_name: computeUpdateValue('first_name'),
      last_name: computeUpdateValue('last_name'),
      email: (() => {
        const value = computeUpdateValue('email');
        return value ?? undefined;
      })(),
      phone_number: computeUpdateValue('phone_number'),
      date_of_birth: computeUpdateValue('date_of_birth'),
      address: computeUpdateValue('address'),
      city: computeUpdateValue('city'),
      province: computeUpdateValue('province'),
      postal_code: computeUpdateValue('postal_code'),
      country: computeUpdateValue('country'),
    };

    const hasChanges = Object.values(updateData).some(
      (value) => value !== undefined,
    );

    if (!hasChanges) {
      hideLoading();
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your profile.',
      });
      return;
    }

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

  useImperativeHandle(ref, () => ({
    saveProfile: handleSaveProfile,
  }));

  const handleResendPendingEmail = async () => {
    const succeeded = await resendPendingEmail();
    if (succeeded) {
      showAlert({
        title: 'Verification Email Sent',
        message: 'Check your inbox to confirm the new address.',
      });
    } else {
      showAlert({
        title: 'Unable to Resend',
        message: 'Please try again in a moment.',
      });
    }
  };

  return (
    <View style={styles.container}>
      {profileDetails ? (
        <GlassCard style={styles.metaCard}>
          <View style={styles.metaContent}>
            <View style={styles.metaColumn}>
              <View style={styles.roleBadge}>
                <ThemedText variant="secondary" style={styles.roleBadgeText}>
                  {profileDetails.role ?? 'Member'}
                </ThemedText>
              </View>
              {profileDetails.role_description ? (
                <ThemedText variant="secondary" style={styles.metaSupporting}>
                  {profileDetails.role_description}
                </ThemedText>
              ) : null}
              {profileDetails.pending_email ? (
                <ThemedText
                  variant="secondary"
                  style={[styles.metaSupporting, styles.pendingText]}
                >
                  Pending confirmation: {profileDetails.pending_email}
                </ThemedText>
              ) : null}
              {profileDetails.pending_email ? (
                <ThemedButton
                  title={
                    isResendingEmail
                      ? 'Resending…'
                      : 'Resend confirmation email'
                  }
                  variant="ghost"
                  fullWidth={false}
                  onPress={handleResendPendingEmail}
                  style={styles.resendButton}
                  disabled={isResendingEmail}
                />
              ) : null}
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaColumn}>
              <ThemedText variant="label" colorToken="label">
                Member Since
              </ThemedText>
              <ThemedText variant="secondary" colorToken="label">
                {formatDate(profileDetails.created_at)}
              </ThemedText>
              <ThemedText variant="secondary" style={styles.metaSupporting}>
                Last updated {formatDate(profileDetails.updated_at)}
              </ThemedText>
              {profileDetails.pending_email_expires_at ? (
                <ThemedText variant="secondary" style={styles.metaSupporting}>
                  Confirmation expires{' '}
                  {formatDate(profileDetails.pending_email_expires_at)}
                </ThemedText>
              ) : null}
            </View>
          </View>
        </GlassCard>
      ) : null}

      {/* Basic Information Fields */}
      {basicFields.map((item) => (
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

      {/* Date of Birth Field */}
      <View style={styles.fieldContainer}>
        <ThemedText variant="label" colorToken="label" style={styles.label}>
          Date of Birth
        </ThemedText>
        <DatePicker
          value={profile.date_of_birth}
          onChange={(date) => updateField('date_of_birth', date)}
          maximumDate={new Date()}
          placeholder="Select date"
        />
      </View>

      {/* Address Fields */}
      {addressFields.map((item) => (
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

      {showInlineSaveButton ? (
        <View style={styles.actions}>
          <ThemedButton
            title="Save Profile"
            variant="primary"
            onPress={handleSaveProfile}
          />
        </View>
      ) : null}
    </View>
  );
});

ProfileContentEditable.displayName = 'ProfileContentEditable';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.lg,
        paddingTop: ds.spacing.md,
      },
      metaCard: {
        width: '100%',
        borderRadius: ds.components.card.borderRadius,
        alignSelf: 'stretch',
      },
      metaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ds.spacing.md,
        paddingHorizontal: ds.spacing.lg,
        gap: ds.spacing.lg,
      },
      metaColumn: {
        flex: 1,
        gap: ds.spacing.xs,
      },
      metaSupporting: {
        opacity: 0.7,
        fontSize: ds.typography.caption.fontSize,
      },
      pendingText: {
        color: theme.primary,
      },
      resendButton: {
        marginTop: ds.spacing.sm,
        alignSelf: 'flex-start',
      },
      metaSeparator: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: theme.divider,
        opacity: 0.6,
      },
      roleBadge: {
        borderRadius: ds.borderRadius.xl,
        paddingVertical: ds.spacing.xs,
        paddingHorizontal: ds.spacing.md,
        backgroundColor: theme.primary,
        borderWidth: 0,
        alignSelf: 'flex-start',
      },
      roleBadgeText: {
        textTransform: 'uppercase',
        fontWeight: ds.fontWeight.semibold,
        letterSpacing: 0.5,
        color: theme.primaryForeground,
      },
      fieldContainer: {
        gap: ds.spacing.sm,
      },
      label: {
        paddingLeft: ds.spacing.xs,
      },
      actions: {
        paddingTop: ds.spacing.md,
        paddingBottom: ds.spacing.xxxl + ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

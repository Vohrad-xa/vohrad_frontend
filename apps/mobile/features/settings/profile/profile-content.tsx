import React, {forwardRef, useImperativeHandle, useEffect} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useEmailConfirmation} from '@vohrad/store';
import {
  ThemedButton,
  ThemedText,
  ThemedView,
  GlassCard,
  InfoRowCard,
  EmptyState,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useLoading} from '@/providers';
import {showConfirmAlert, showAlert, formatDate} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {useProfileForm} from './use-profile-form';

export type SaveProfileOptions = {
  skipConfirm?: boolean;
};

export type ProfileContentHandle = {
  saveProfile: (options?: SaveProfileOptions) => void;
  hasChanges: () => boolean;
};

type ProfileContentEditableProps = {
  isEditing: boolean;
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};

export const ProfileContentEditable = forwardRef<
  ProfileContentHandle,
  ProfileContentEditableProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {showLoading, hideLoading} = useLoading();

  const {
    profileDetails,
    profile,
    personalInfoFields,
    contactFields,
    addressFields,
    updateField,
    hasChanges,
    submitUpdate,
  } = useProfileForm();

  const {resendPendingEmail, isProcessing: isResendingEmail} =
    useEmailConfirmation();

  const performUpdate = async () => {
    showLoading('Updating profile...');

    if (!hasChanges()) {
      hideLoading();
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your profile.',
      });
      return;
    }

    try {
      await submitUpdate();
      hideLoading();
      onSaveComplete?.();
    } catch (err) {
      hideLoading();
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile';
      showAlert({
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  const handleSaveProfile = (options?: SaveProfileOptions) => {
    if (options?.skipConfirm) {
      void performUpdate();
      return;
    }

    showConfirmAlert({
      title: 'Update Profile',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      cancelText: 'Discard',
      cancelIsDestructive: true,
      onConfirm: () => {
        void performUpdate();
      },
    });
  };

  useImperativeHandle(ref, () => ({
    saveProfile: handleSaveProfile,
    hasChanges,
  }));

  useEffect(() => {
    onFieldChange?.();
  }, [profile, onFieldChange]);

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

  if (!profileDetails) {
    return <EmptyState message="No profile information available" />;
  }

  return (
    <View style={styles.container}>
      {/* Profile Meta Card */}
      <GlassCard style={styles.metaCard} isInteractive>
        <View style={styles.metaContent}>
          <View style={styles.metaColumn}>
            <ThemedView variant="roleBadge">
              <ThemedText variant="badgeText">
                {profileDetails.role ?? 'Member'}
              </ThemedText>
            </ThemedView>
            {profileDetails.role_description && (
              <ThemedText variant="secondary" style={styles.metaSupporting}>
                {profileDetails.role_description}
              </ThemedText>
            )}
            {profileDetails.pending_email && (
              <>
                <ThemedText variant="secondary" style={styles.metaSupporting}>
                  Pending confirmation: {profileDetails.pending_email}
                </ThemedText>
                <ThemedButton
                  title={
                    isResendingEmail
                      ? 'Resending…'
                      : 'Resend confirmation email'
                  }
                  variant="ghost"
                  fullWidth={false}
                  onPress={handleResendPendingEmail}
                  disabled={isResendingEmail}
                />
              </>
            )}
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
            {profileDetails.pending_email_expires_at && (
              <ThemedText variant="secondary" style={styles.metaSupporting}>
                Confirmation expires{' '}
                {formatDate(profileDetails.pending_email_expires_at)}
              </ThemedText>
            )}
          </View>
        </View>
      </GlassCard>

      {/* Personal Information */}
      <View style={[styles.section, styles.sectionWithDatePicker]}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Personal Information
        </ThemedText>
        <InfoRowCard
          fields={personalInfoFields}
          editable={isEditing}
          values={profile}
          onFieldChange={updateField}
          autoFocus
        />
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Contact
        </ThemedText>
        <InfoRowCard
          fields={contactFields}
          editable={isEditing}
          values={profile}
          onFieldChange={updateField}
          autoFocus={false}
        />
      </View>

      {/* Address */}
      <View style={styles.section}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Address
        </ThemedText>
        <InfoRowCard
          fields={addressFields}
          editable={isEditing}
          values={profile}
          onFieldChange={updateField}
          autoFocus={false}
        />
      </View>
    </View>
  );
});

ProfileContentEditable.displayName = 'ProfileContentEditable';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.xl,
        paddingTop: ds.spacing.md,
      },
      section: {
        gap: ds.spacing.md,
      },
      sectionWithDatePicker: {
        position: 'relative',
        zIndex: 100,
      },
      sectionTitle: {
        ...ds.typography.heading,
        paddingHorizontal: Platform.OS === 'web' ? 0 : ds.spacing.xl,
      },
      metaCard: {
        width: '100%',
        borderRadius: ds.components.card.borderRadius,
        alignSelf: 'stretch',
      },
      metaContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: ds.spacing.md,
        paddingHorizontal: ds.spacing.lg,
        gap: ds.spacing.lg,
      },
      metaColumn: {
        flex: 1,
        gap: ds.spacing.xs,
      },
      metaSupporting: {
        ...ds.typography.caption,
        opacity: ds.opacity.muted,
      },
      metaSeparator: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: theme.divider,
        opacity: ds.opacity.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

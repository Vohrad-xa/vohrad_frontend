import React, {forwardRef, useImperativeHandle, useEffect} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {
  ThemedButton,
  ThemedText,
  ThemedView,
  GlassCard,
  InfoRowCard,
  EmptyState,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {useProfileForm, useProfileActions} from '../hooks';
import type {ProfileContentHandle, ProfileContentProps} from '../types';

export const ProfileContentEditable = forwardRef<
  ProfileContentHandle,
  ProfileContentProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    profileDetails,
    profile,
    personalInfoFields,
    contactFields,
    addressFields,
    updateField,
  } = useProfileForm();

  const {
    hasChanges,
    handleSaveProfile,
    handleResendPendingEmail,
    isResendingEmail,
  } = useProfileActions({onSaveComplete});

  useImperativeHandle(ref, () => ({
    saveProfile: handleSaveProfile,
    hasChanges,
  }));

  useEffect(() => {
    onFieldChange?.();
  }, [profile, onFieldChange]);

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
              <ThemedText variant="footnote">
                {profileDetails.role ?? 'Member'}
              </ThemedText>
            </ThemedView>
            {profileDetails.role_description && (
              <ThemedText variant="caption" style={styles.metaSupporting}>
                {profileDetails.role_description}
              </ThemedText>
            )}
            {profileDetails.pending_email && (
              <>
                <ThemedText variant="caption" style={styles.metaSupporting}>
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
            <ThemedText variant="label">Member Since</ThemedText>
            <ThemedText variant="caption">
              {formatDate(profileDetails.created_at)}
            </ThemedText>
            <ThemedText variant="caption" style={styles.metaSupporting}>
              Last updated {formatDate(profileDetails.updated_at)}
            </ThemedText>
            {profileDetails.pending_email_expires_at && (
              <ThemedText variant="caption" style={styles.metaSupporting}>
                Confirmation expires{' '}
                {formatDate(profileDetails.pending_email_expires_at)}
              </ThemedText>
            )}
          </View>
        </View>
      </GlassCard>

      {/* Personal Information */}
      <View style={[styles.section, styles.sectionWithDatePicker]}>
        <ThemedText variant="headline" style={styles.sectionTitle}>
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
        <ThemedText variant="headline" style={styles.sectionTitle}>
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
        <ThemedText variant="headline" style={styles.sectionTitle}>
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
        // ...ds.typography.headline,
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
        // ...ds.typography.caption,
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

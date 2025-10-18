import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText, ThemedView, GlassCard, InfoRowCard} from '@/components/ui';
import type {BadgeStatus} from '@/components/ui/themed-view';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useLoading} from '@/providers';
import {formatDate, showConfirmAlert, showAlert} from '@/utils';
import {Icon, AppIcons} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {useOrganizationForm} from './use-organization-form';

export type OrganizationContentHandle = {
  saveOrganization: () => void;
};

type OrganizationContentProps = {
  isEditing: boolean;
  onSaveComplete?: () => void;
};

export const OrganizationContent = forwardRef<
  OrganizationContentHandle,
  OrganizationContentProps
>(({isEditing, onSaveComplete}, ref) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {showLoading, hideLoading} = useLoading();

  const {
    organization,
    stagedValues,
    businessFields,
    addressFields,
    remarksFields,
    handleFieldChange,
    hasChanges,
    submitUpdate,
  } = useOrganizationForm(isEditing);

  const performUpdate = async () => {
    showLoading('Updating organization...');

    if (!hasChanges()) {
      hideLoading();
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your organization.',
      });
      return;
    }

    try {
      await submitUpdate();
      hideLoading();
      onSaveComplete?.();
      showAlert({
        title: 'Success',
        message: 'Organization updated successfully',
      });
    } catch (err) {
      hideLoading();
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update organization';
      showAlert({
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  const handleSaveProfile = () => {
    showConfirmAlert({
      title: 'Update Organization',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm: () => {
        performUpdate();
      },
    });
  };

  useImperativeHandle(ref, () => ({
    saveOrganization: handleSaveProfile,
  }));

  if (!organization) {
    return (
      <View style={styles.container}>
        <ThemedText variant="secondary" style={styles.emptyState}>
          No organization information available
        </ThemedText>
      </View>
    );
  }

  const renderSectionHeader = (title: string) => {
    return (
      <View style={styles.sectionHeader}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Organization Meta Card */}
      <GlassCard style={styles.metaCard}>
        <View style={styles.metaContent}>
          <View style={styles.logoCircle}>
            <Icon name={AppIcons.business.organization} size={32} />
          </View>

          <View style={styles.metaSeparator} />

          <View style={styles.metaColumn}>
            <View style={styles.metaRow}>
              <ThemedText variant="label" colorToken="label">
                {organization.sub_domain}
              </ThemedText>
              <ThemedView
                variant="statusBadge"
                badgeStatus={organization.status as BadgeStatus}
              >
                <ThemedText variant="badgeText">
                  {organization.status}
                </ThemedText>
              </ThemedView>
            </View>
            <ThemedText variant="secondary" colorToken="label">
              {organization.email}
            </ThemedText>
            <ThemedText variant="secondary" style={styles.metaSupporting}>
              Since {formatDate(organization.created_at)}
            </ThemedText>
          </View>
        </View>
      </GlassCard>

      {/* Business Details */}
      <View style={styles.section}>
        {renderSectionHeader('Business Details')}
        <InfoRowCard
          fields={businessFields}
          editable={isEditing}
          values={stagedValues}
          onFieldChange={handleFieldChange}
          autoFocus={true}
        />
      </View>

      {/* Address */}
      <View style={styles.section}>
        {renderSectionHeader('Address')}
        <InfoRowCard
          fields={addressFields}
          editable={isEditing}
          values={stagedValues}
          onFieldChange={handleFieldChange}
          autoFocus={false}
        />
      </View>

      {/* Additional Information */}
      {remarksFields.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('Additional Information')}
          <InfoRowCard
            fields={remarksFields}
            editable={isEditing}
            values={stagedValues}
            onFieldChange={handleFieldChange}
            autoFocus={false}
          />
        </View>
      )}
    </View>
  );
});

OrganizationContent.displayName = 'OrganizationContent';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.xl,
        paddingTop: ds.spacing.md,
      },
      emptyState: {
        textAlign: 'center',
        opacity: ds.opacity.muted,
        paddingVertical: ds.spacing.xxxl,
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
      metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.quickActionIcon,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: ds.opacity.muted,
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
      section: {
        gap: ds.spacing.md,
      },
      sectionHeader: {
        paddingLeft: ds.spacing.xs,
      },
      sectionTitle: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

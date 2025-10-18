import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useOrganizationDetails} from '@vohrad/store';
import {
  ThemedText,
  ThemedView,
  FormCard,
  GlassCard,
  InfoRow,
} from '@/components/ui';
import type {BadgeStatus} from '@/components/ui/themed-view';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {Icon, AppIcons} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

type InfoField = {
  key: string;
  label: string;
  value?: string | null;
};

export const OrganizationContent: React.FC = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const organization = useOrganizationDetails();

  if (!organization) {
    return (
      <View style={styles.container}>
        <ThemedText variant="secondary" style={styles.emptyState}>
          No organization information available
        </ThemedText>
      </View>
    );
  }

  const renderInfoField = ({item}: {item: InfoField}) => (
    <InfoRow label={item.label} value={item.value} />
  );

  const businessFields: InfoField[] = [
    {key: 'email', label: 'Email', value: organization.email},
    {key: 'telephone', label: 'Phone', value: organization.telephone},
    {key: 'website', label: 'Website', value: organization.website},
    {key: 'industry', label: 'Industry', value: organization.industry},
    {key: 'tax_id', label: 'Tax ID', value: organization.tax_id},
  ];

  const addressFields: InfoField[] = [
    {key: 'street', label: 'Street', value: organization.street},
    {
      key: 'street_number',
      label: 'Street Number',
      value: organization.street_number,
    },
    {key: 'city', label: 'City', value: organization.city},
    {key: 'province', label: 'Province', value: organization.province},
    {key: 'postal_code', label: 'Postal Code', value: organization.postal_code},
    {key: 'country', label: 'Country', value: organization.country},
  ];

  const businessHoursFields: InfoField[] = [
    {key: 'timezone', label: 'Timezone', value: organization.timezone},
    {
      key: 'business_hour_start',
      label: 'Business Hours Start',
      value: organization.business_hour_start,
    },
    {
      key: 'business_hour_end',
      label: 'Business Hours End',
      value: organization.business_hour_end,
    },
  ];

  const remarksFields: InfoField[] = organization.remarks
    ? [{key: 'remarks', label: 'Remarks', value: organization.remarks}]
    : [];

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
              Since {formatDate(organization.created_at)}
            </ThemedText>
            <ThemedText variant="secondary" style={styles.metaSupporting}>
              Last updated {formatDate(organization.updated_at)}
            </ThemedText>
          </View>
        </View>
      </GlassCard>

      {/* Business Details */}
      <View style={styles.section}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Business Details
        </ThemedText>
        <FormCard<InfoField>
          data={businessFields}
          keyExtractor={(item) => item.key}
          renderItem={renderInfoField}
        />
      </View>

      {/* Address */}
      <View style={styles.section}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Address
        </ThemedText>
        <FormCard<InfoField>
          data={addressFields}
          keyExtractor={(item) => item.key}
          renderItem={renderInfoField}
        />
      </View>

      {/* Business Hours */}
      <View style={styles.section}>
        <ThemedText variant="heading" style={styles.sectionTitle}>
          Business Hours & Settings
        </ThemedText>
        <FormCard<InfoField>
          data={businessHoursFields}
          keyExtractor={(item) => item.key}
          renderItem={renderInfoField}
        />
      </View>

      {/* Additional Information */}
      {remarksFields.length > 0 && (
        <View style={styles.section}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Additional Information
          </ThemedText>
          <FormCard<InfoField>
            data={remarksFields}
            keyExtractor={(item) => item.key}
            renderItem={renderInfoField}
          />
        </View>
      )}
    </View>
  );
};

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
        opacity: ds.opacity.muted,
        fontSize: ds.typography.caption.fontSize,
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
      sectionTitle: {
        paddingLeft: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

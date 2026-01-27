import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useOrganizationManager} from '@sykamore/store';
import {ThemedText, ThemedView} from '@/components/ui';
import type {BadgeStatus} from '@/components/ui/themed-view';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons, formatDate, makeStyleFactory} from '@/utils';

export function OrganizationHeaderInfo() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {organization} = useOrganizationManager(false);

  return (
    <View style={styles.header}>
      <View style={styles.logoCircle}>
        <Icon name={AppIcons.domain.organization} size="xxl" />
      </View>

      <View style={styles.headerSeparator} />

      <View style={styles.headerColumn}>
        <View style={styles.headerRow}>
          <ThemedText variant="label">{organization.sub_domain}</ThemedText>
          <ThemedView
            variant="statusBadge"
            badgeStatus={organization.status as BadgeStatus}
          >
            <ThemedText variant="footnote">{organization.status}</ThemedText>
          </ThemedView>
        </View>
        <ThemedText variant="caption">{organization.email}</ThemedText>
        <ThemedText variant="caption" style={styles.headerSupporting}>
          Since {formatDate(organization.created_at)}
        </ThemedText>
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: ds.spacing.md,
        paddingHorizontal: ds.spacing.lg,
        gap: ds.spacing.lg,
        backgroundColor: theme.modalBackground,
        borderRadius: ds.components.card.borderRadius,
      },
      headerColumn: {
        flex: 1,
        gap: ds.spacing.xs,
      },
      headerRow: {
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
      headerSupporting: {
        opacity: ds.opacity.muted,
      },
      headerSeparator: {
        width: StyleSheet.hairlineWidth,
        alignSelf: 'stretch',
        backgroundColor: theme.divider,
        opacity: ds.opacity.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

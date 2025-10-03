import React, {Fragment} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Palette} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import {ThemedText} from '@/components/ui';
import {useProfileDetails} from './use-profile-details';

type ThemeType = ReturnType<typeof useTheme>['theme'];

type RowConfig = {
  key: string;
  label: string;
  value: string | null;
};

export function ProfileContent() {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme, scheme);
  const profile = useProfileDetails();

  const buttonBackground = scheme === 'dark' ? Palette.Lbackground : Palette.black;
  const buttonTextColor = scheme === 'dark' ? Palette.black : Palette.Lbackground;

  const rows: RowConfig[] = [
    {key: 'firstName', label: 'First Name', value: profile.firstName},
    {key: 'lastName', label: 'Last Name', value: profile.lastName},
    {key: 'email', label: 'Email', value: profile.email},
    {key: 'address', label: 'Address', value: profile.address},
    {key: 'phone', label: 'Phone Number', value: profile.phoneNumber},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <ThemedText variant="title3" style={styles.sectionTitle}>
          Profile Information
        </ThemedText>

        <View style={styles.detailsCard}>
          {rows.map((row, index) => {
            const isLast = index === rows.length - 1;
            const value = row.value ?? 'Not provided';

            return (
              <Fragment key={row.key}>
                <View style={styles.row}>
                  <ThemedText variant="body" style={styles.rowLabel}>
                    {row.label}
                  </ThemedText>
                  <ThemedText
                    variant="body"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.rowValue, !row.value && styles.placeholderValue]}>
                    {value}
                  </ThemedText>
                </View>
                {!isLast && <View style={styles.separator} />}
              </Fragment>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.updateButton, {backgroundColor: buttonBackground}]}
        onPress={() => {}}>
        <ThemedText variant="interactive" style={[styles.updateButtonText, {color: buttonTextColor}]}>
          Update Email
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const CARD_BACKGROUND = '#30302E';

const createStyles = (ds: typeof DesignSystem, theme: ThemeType, scheme: 'light' | 'dark') => {
  const primaryText = scheme === 'dark' ? theme.text : Palette.Lbackground;
  const secondaryText = scheme === 'dark' ? theme.muted : 'rgba(255, 255, 255, 0.66)';
  const placeholderText = scheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  const separatorColor = scheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.16)';

  return StyleSheet.create({
    container: {
      gap: ds.spacing.xl,
      paddingHorizontal: ds.spacing.xl,
      top: ds.spacing.xl,
    },
    section: {
      gap: ds.spacing.md,
    },
    sectionTitle: {
      color: primaryText,
      fontWeight: ds.fontWeight.semibold,
    },
    detailsCard: {
      borderRadius: ds.borderRadius.xxxl,
      backgroundColor: CARD_BACKGROUND,
      paddingHorizontal: ds.spacing.xl,
      paddingVertical: ds.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: ds.spacing.md,
    },
    rowLabel: {
      flex: 1,
      marginRight: ds.spacing.md,
      color: secondaryText,
      fontWeight: ds.fontWeight.medium,
    },
    rowValue: {
      maxWidth: '60%',
      textAlign: 'right',
      color: primaryText,
      fontWeight: ds.fontWeight.semibold,
    },
    placeholderValue: {
      color: placeholderText,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: separatorColor,
      marginHorizontal: -ds.spacing.xl,
    },
    updateButton: {
      alignSelf: 'stretch',
      borderRadius: ds.borderRadius.xxxl,
      paddingVertical: ds.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    updateButtonText: {
      fontWeight: ds.fontWeight.semibold,
    },
  });
};

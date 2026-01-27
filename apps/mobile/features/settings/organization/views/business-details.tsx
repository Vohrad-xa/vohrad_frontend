import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Avatar, List, Surface} from 'react-native-paper';
import {router} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {useBusinessDetails} from '../use-business-details';

export const BusinessDetailsContent = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useBusinessDetails();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Surface elevation={1} mode="flat" style={styles.surface}>
        <List.Item
          title={title}
          description={subtitle}
          left={() => <Avatar.Text label={avatarLabel} />}
        />
      </Surface>

      <List.Section>
        <List.Item
          title="Organization info"
          description="Name, email, phone, address"
          onPress={() =>
            router.push('/(app)/(tabs)/settings/organization/organization-info')
          }
        />

        <List.Item
          title="License & Billing"
          description="Plan, payment method, billing history"
        />

        <List.Item
          title="Business hours"
          description="Set your business hours"
        />

        <List.Item
          title="Members"
          description="Manage your organization members"
        />
      </List.Section>
    </ScrollView>
  );
};

BusinessDetailsContent.displayName = 'BusinessDetailsContent';

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      content: {
        gap: ds.spacing.md,
        paddingVertical: ds.spacing.md,
      },
      surface: {
        borderRadius: ds.borderRadius.xxxl,
        marginHorizontal: ds.spacing.md,
        paddingHorizontal: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

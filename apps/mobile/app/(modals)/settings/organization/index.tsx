import React from 'react';
import {StyleSheet} from 'react-native';
import {router} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ThemedView, ThemedText, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {OrganizationHeaderInfo} from '@/features/settings/organization/components';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <OrganizationHeaderInfo />

        <Card>
          <Card.Row
            icon={AppIcons.business.organization}
            onPress={() =>
              router.push('/(modals)/settings/organization/business-details')
            }
          >
            <ThemedText variant="label">Business Details</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row icon={AppIcons.business.profile}>
            <ThemedText variant="label">Users</ThemedText>
          </Card.Row>
          <Card.Divider withIconOffset />
          <Card.Row
            icon={AppIcons.business.plan}
            onPress={() => router.push('/(modals)/settings/organization/plan')}
          >
            <ThemedText variant="label">Plan</ThemedText>
          </Card.Row>
        </Card>
      </ModalScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      content: {
        gap: ds.spacing.xl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

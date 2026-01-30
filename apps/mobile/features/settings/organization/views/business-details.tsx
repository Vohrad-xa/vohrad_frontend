import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {router} from 'expo-router';
import {Avatar, List, Surface, type ListItemProps} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette} from '@/constants';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {useBusinessDetails} from '../hooks/use-business-details';

type RightProps = Parameters<NonNullable<ListItemProps['right']>>[0];

export const BusinessDetailsContent = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useBusinessDetails();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <List.Section>
        <Surface elevation={0} style={styles.surface}>
          <List.Item
            title={<ThemedText variant="title1">{title}</ThemedText>}
            description={<ThemedText variant="caption">{subtitle}</ThemedText>}
            right={(props: RightProps) => (
              <Avatar.Text
                label={avatarLabel}
                {...props}
                style={props.style}
                color={Palette.white}
                size={45}
              />
            )}
          />
        </Surface>
      </List.Section>

      <List.Section style={styles.section}>
        <Surface elevation={1} mode="flat" style={styles.surfaceTop}>
          <List.Item
            title="Organization info"
            description="Name, email, phone, address"
            borderless
            onPress={() =>
              router.push(
                '/(app)/(tabs)/settings/organization/organization-info',
              )
            }
            right={(props: RightProps) => (
              <List.Icon icon="chevron-right" {...props} />
            )}
          />
        </Surface>

        <Surface elevation={1} mode="flat" style={{overflow: 'hidden'}}>
          <List.Item
            title="License & Billing"
            description="Plan, payment method"
            borderless
            onPress={() =>
              router.push('/(app)/(tabs)/settings/organization/license')
            }
            right={(props: RightProps) => (
              <List.Icon icon="chevron-right" {...props} />
            )}
          />
        </Surface>

        <Surface elevation={1} mode="flat" style={{overflow: 'hidden'}}>
          <List.Item
            title="Business hours"
            description="Set your business hours"
            borderless
            onPress={() =>
              router.push('/(app)/(tabs)/settings/organization/business-hours')
            }
            right={(props: RightProps) => (
              <List.Icon icon="chevron-right" {...props} />
            )}
          />
        </Surface>

        <Surface elevation={1} mode="flat" style={styles.surfaceBottom}>
          <List.Item
            title="Manage members"
            description="Manage users in your organization"
            borderless
            right={(props: RightProps) => (
              <List.Icon icon="chevron-right" {...props} />
            )}
          />
        </Surface>
      </List.Section>
    </ScrollView>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {flex: 1},

      content: {
        paddingHorizontal: ds.spacing.lg,
      },

      section: {
        gap: ds.spacing.xxs,
      },

      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },

      surfaceTop: {
        borderTopLeftRadius: ds.borderRadius.xxxl,
        borderTopRightRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },

      surfaceBottom: {
        borderBottomLeftRadius: ds.borderRadius.xxxl,
        borderBottomRightRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

BusinessDetailsContent.displayName = 'BusinessDetailsContent';

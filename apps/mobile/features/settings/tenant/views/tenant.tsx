import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {type Href} from 'expo-router';
import {Avatar, List, Surface, type ListItemProps} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, useSafeRouter, AppIcons} from '@/utils';
import {TENANT_FIELDS} from '../constants/organization-constants';
import {useTenantDetails} from '../hooks/use-tenant-details';

type tenantRowModel = Readonly<{
  title: string;
  description: string;
  href: Href;
}>;

// Extracting the type of props passed to List.Item's right callback
type RightProps = Parameters<NonNullable<ListItemProps['right']>>[0];

const TenantRow = memo(({title, description, href}: tenantRowModel) => {
  const router = useSafeRouter();

  return (
    <List.Item
      title={title}
      description={description}
      right={(props) => (
        <List.Icon {...props} icon={AppIcons.actions.forward} />
      )}
      onPress={() => router.push(href)}
      borderless
    />
  );
});

export const TenantDetailsContent = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useTenantDetails();

  const TENANT_ROWS = [
    TENANT_FIELDS.info,
    TENANT_FIELDS.license,
    TENANT_FIELDS.businessHours,
  ] as const satisfies readonly tenantRowModel[];
  const renderAvatar = useCallback(
    (props: RightProps) => (
      <Avatar.Text
        label={avatarLabel}
        labelStyle={{letterSpacing: 2}}
        accessibilityLabel={`${title} avatar`}
        {...props}
        color={Palette.white}
        size={48}
      />
    ),
    [avatarLabel, title],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <List.Section>
        <List.Item
          title={<ThemedText variant="title1">{title}</ThemedText>}
          description={<ThemedText variant="caption">{subtitle}</ThemedText>}
          right={renderAvatar}
        />
      </List.Section>

      <List.Section style={styles.section}>
        <Surface mode="flat" style={[styles.surface, styles.surfaceTop]}>
          <TenantRow {...TENANT_ROWS[0]} />
        </Surface>

        <Surface mode="flat" style={styles.surface}>
          <TenantRow {...TENANT_ROWS[1]} />
        </Surface>

        <Surface mode="flat" style={[styles.surface, styles.surfaceBottom]}>
          <TenantRow {...TENANT_ROWS[2]} />
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
        paddingHorizontal: ds.spacing.md,
      },

      section: {
        gap: ds.spacing.xxs,
      },

      surface: {
        overflow: 'hidden',
      },

      surfaceTop: {
        borderTopLeftRadius: ds.borderRadius.xxl,
        borderTopRightRadius: ds.borderRadius.xxl,
      },

      surfaceBottom: {
        borderBottomLeftRadius: ds.borderRadius.xxl,
        borderBottomRightRadius: ds.borderRadius.xxl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

TenantRow.displayName = 'TenantRow';
TenantDetailsContent.displayName = 'TenantDetailsContent';

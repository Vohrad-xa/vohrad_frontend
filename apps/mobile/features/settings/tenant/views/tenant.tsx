import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {type Href} from 'expo-router';
import {
  Avatar,
  List,
  Surface,
  Divider,
  type ListItemProps,
} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, useSafeRouter, AppIcons} from '@/utils';
import {TENANT_FIELDS} from '../constants/organization-constants';
import {useTenantDetails} from '../hooks/use-tenant-details';

type TenantRowModel = Readonly<{
  title: string;
  description: string;
  href: Href;
}>;

// Extracting the type of props passed to List.Item's right callback
type RightProps = Parameters<NonNullable<ListItemProps['right']>>[0];

const TenantRow = memo(({title, description, href}: TenantRowModel) => {
  const router = useSafeRouter();
  const {theme, ds} = useTheme();

  return (
    <List.Item
      title={title}
      description={description}
      right={(props) => (
        <List.Icon {...props} icon={AppIcons.actions.forward} />
      )}
      onPress={() => router.push(href)}
      borderless
      style={{borderRadius: ds.borderRadius.sm, backgroundColor: theme.card}}
    />
  );
});

const TENANT_ROWS = [
  TENANT_FIELDS.info,
  TENANT_FIELDS.license,
  TENANT_FIELDS.businessHours,
  TENANT_FIELDS.users,
] as const satisfies readonly TenantRowModel[];

export const TenantDetailsContent = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useTenantDetails();
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

  const renderRows = (rows: readonly TenantRowModel[]) => (
    <Surface mode="flat" style={styles.surface}>
      {rows.map((row, idx) => (
        <React.Fragment key={String(row.href)}>
          <TenantRow {...row} />
          {idx !== rows.length - 1 && <Divider style={styles.divider} />}
        </React.Fragment>
      ))}
    </Surface>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <List.Item
        title={<ThemedText variant="title1">{title}</ThemedText>}
        description={<ThemedText variant="caption">{subtitle}</ThemedText>}
        right={renderAvatar}
      />

      <List.Section>{renderRows(TENANT_ROWS)}</List.Section>
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

      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      },

      divider: {
        height: 1.9,
        backgroundColor: 'transparent',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

TenantRow.displayName = 'TenantRow';
TenantDetailsContent.displayName = 'TenantDetailsContent';

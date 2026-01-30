import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {type Href} from 'expo-router';
import {Avatar, List, Surface, type ListItemProps} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape, Palette} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, useSafeRouter, AppIcons} from '@/utils';
import {ORGANIZATION_FIELDS} from '../constants/organization-constants';
import {useBusinessDetails} from '../hooks/use-business-details';

type BusinessRowModel = Readonly<{
  title: string;
  description: string;
  href: Href;
}>;

// Extracting the type of props passed to List.Item's right callback
type RightProps = Parameters<NonNullable<ListItemProps['right']>>[0];

const BusinessRow = memo(({title, description, href}: BusinessRowModel) => {
  const router = useSafeRouter();

  const onPress = useCallback(() => {
    router.push(href);
  }, [router, href]);

  const renderRight = useCallback(
    (props: RightProps) => (
      <List.Icon {...props} icon={AppIcons.actions.forward} />
    ),
    [],
  );

  return (
    <List.Item
      title={title}
      description={description}
      right={renderRight}
      onPress={onPress}
      borderless
    />
  );
});

export const BusinessDetailsContent = () => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {title, subtitle, avatarLabel} = useBusinessDetails();

  const BUSINESS_ROWS = [
    ORGANIZATION_FIELDS.info,
    ORGANIZATION_FIELDS.license,
    ORGANIZATION_FIELDS.businessHours,
  ] as const satisfies readonly BusinessRowModel[];

  const renderAvatar = useCallback(
    (props: RightProps) => (
      <Avatar.Text
        label={avatarLabel}
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
        <Surface elevation={1} mode="flat" style={styles.surfaceTop}>
          <BusinessRow {...BUSINESS_ROWS[0]} />
        </Surface>

        <Surface elevation={1} mode="flat" style={styles.surface}>
          <BusinessRow {...BUSINESS_ROWS[1]} />
        </Surface>

        <Surface
          elevation={1}
          mode="flat"
          style={[styles.surface, styles.surfaceBottom]}
        >
          <BusinessRow {...BUSINESS_ROWS[2]} />
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

BusinessRow.displayName = 'BusinessRow';
BusinessDetailsContent.displayName = 'BusinessDetailsContent';

import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {type Href} from 'expo-router';
import {Surface, Avatar, List, type ListItemProps} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {
  makeStyleFactory,
  getInitials,
  formatDate,
  useSafeRouter,
  AppIcons,
} from '@/utils';
import {PROFILE_FIELDS} from '../constants/profile-constants';
import {useProfile} from '../hooks';

const NOT_SET = 'Not set';

type ProfileRowModel = Readonly<{
  title: string;
  valueText: string;
  a11yLabel: string;
  a11yHint: string;
  href: Href;
  descriptionProps?: Pick<
    React.ComponentProps<typeof List.Item>,
    'descriptionNumberOfLines' | 'descriptionEllipsizeMode'
  >;
}>;

// Extracting the type of props passed to List.Item's right callback
type RightProps = Parameters<NonNullable<ListItemProps['right']>>[0];

const ProfileRow = memo(
  ({
    title,
    valueText,
    a11yLabel,
    a11yHint,
    href,
    descriptionProps,
  }: ProfileRowModel) => {
    const router = useSafeRouter();

    return (
      <List.Item
        title={title}
        description={valueText}
        right={(props) => (
          <List.Icon {...props} icon={AppIcons.actions.forward} />
        )}
        onPress={() => router.push(href)}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        {...descriptionProps}
        borderless
      />
    );
  },
);

export function ProfileContent() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    profileDetails,
    fullName,
    dateOfBirth,
    email,
    phoneNumber,
    city,
    postalCode,
    country,
  } = useProfile();

  const displayName = fullName?.trim() || 'User';
  const initials = getInitials(displayName) ?? 'U';

  const memberSince = profileDetails?.created_at
    ? formatDate(profileDetails.created_at)
    : '—';

  const roleText = profileDetails?.role ?? 'Member';
  const birthDateText = dateOfBirth ? formatDate(dateOfBirth) : NOT_SET;

  const emailText = email || NOT_SET;
  const phoneText = phoneNumber || NOT_SET;
  const shortAddress =
    [city, postalCode, country].filter(Boolean).join(' ') || NOT_SET;

  const PERSONAL_ROWS = [
    {...PROFILE_FIELDS.name, valueText: displayName},
    {...PROFILE_FIELDS.dateOfBirth, valueText: birthDateText},
  ] as const satisfies ReadonlyArray<Omit<ProfileRowModel, 'descriptionProps'>>;

  const CONTACT_ROWS = [
    {...PROFILE_FIELDS.email, valueText: emailText},
    {...PROFILE_FIELDS.phoneNumber, valueText: phoneText},
  ] as const satisfies ReadonlyArray<Omit<ProfileRowModel, 'descriptionProps'>>;

  const ADDRESS_ROWS = [
    {
      ...PROFILE_FIELDS.address,
      valueText: shortAddress,
      descriptionProps: {
        descriptionNumberOfLines: 1,
        descriptionEllipsizeMode: 'middle',
      },
    },
  ] as const satisfies readonly ProfileRowModel[];

  const renderAvatar = useCallback(
    (props: RightProps) => (
      <Avatar.Text
        label={initials}
        labelStyle={{letterSpacing: 2}}
        accessibilityLabel={`${displayName} avatar`}
        {...props}
        color={Palette.white}
        size={48}
      />
    ),
    [displayName, initials],
  );
  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Item
          title={<ThemedText variant="title1">{displayName}</ThemedText>}
          description={
            <ThemedText variant="footnote" colorToken="muted">
              {roleText} • Since {memberSince}
            </ThemedText>
          }
          right={renderAvatar}
        />
      </List.Section>

      <List.Section style={{gap: ds.spacing.xxs}}>
        <Surface mode="flat" style={styles.surfaceTop}>
          <ProfileRow {...PERSONAL_ROWS[0]} />
        </Surface>

        <Surface mode="flat" style={styles.surfaceBottom}>
          <ProfileRow {...PERSONAL_ROWS[1]} />
        </Surface>
      </List.Section>

      <List.Section style={{gap: ds.spacing.xxs}}>
        <Surface mode="flat" style={styles.surfaceTop}>
          <ProfileRow {...CONTACT_ROWS[0]} />
        </Surface>

        <Surface mode="flat" style={styles.surfaceBottom}>
          <ProfileRow {...CONTACT_ROWS[1]} />
        </Surface>
      </List.Section>

      <List.Section style={{gap: ds.spacing.xxs}}>
        <Surface mode="flat" style={[styles.surfaceTop, styles.surfaceBottom]}>
          <ProfileRow {...ADDRESS_ROWS[0]} />
        </Surface>
      </List.Section>
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {flex: 1},

      surfaceTop: {
        borderTopLeftRadius: ds.borderRadius.xxl,
        borderTopRightRadius: ds.borderRadius.xxl,
        overflow: 'hidden',
      },

      surfaceBottom: {
        borderBottomLeftRadius: ds.borderRadius.xxl,
        borderBottomRightRadius: ds.borderRadius.xxl,
        overflow: 'hidden',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

ProfileRow.displayName = 'ProfileRow';

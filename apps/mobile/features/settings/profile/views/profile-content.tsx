import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {type Href} from 'expo-router';
import {
  Surface,
  Avatar,
  List,
  type ListItemProps,
  Divider,
} from 'react-native-paper';
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
    const {ds, theme} = useTheme();

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
        style={{borderRadius: ds.borderRadius.sm, backgroundColor: theme.card}}
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

  const emailText = email ?? NOT_SET;
  const phoneText = phoneNumber ?? NOT_SET;
  const shortAddress =
    [city, postalCode, country].filter(Boolean).join(' ') || NOT_SET;

  const PERSONAL_ROWS = [
    {...PROFILE_FIELDS.name, valueText: displayName},
    {...PROFILE_FIELDS.dateOfBirth, valueText: birthDateText},
  ] as const satisfies readonly ProfileRowModel[];

  const CONTACT_ROWS = [
    {...PROFILE_FIELDS.email, valueText: emailText},
    {...PROFILE_FIELDS.phoneNumber, valueText: phoneText},
  ] as const satisfies readonly ProfileRowModel[];

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

  const renderRows = (rows: readonly ProfileRowModel[]) => (
    <Surface mode="flat" style={styles.surface}>
      {rows.map((row, idx) => (
        <React.Fragment key={String(row.href)}>
          <ProfileRow {...row} />
          {idx !== rows.length - 1 && <Divider style={styles.divider} />}
        </React.Fragment>
      ))}
    </Surface>
  );

  return (
    <ScrollView style={styles.container}>
      <List.Item
        title={<ThemedText variant="title1">{displayName}</ThemedText>}
        description={
          <ThemedText variant="footnote" colorToken="muted">
            {roleText} • Since {memberSince}
          </ThemedText>
        }
        right={renderAvatar}
      />

      <List.Section>{renderRows(PERSONAL_ROWS)}</List.Section>

      <List.Section>{renderRows(CONTACT_ROWS)}</List.Section>

      <List.Section>{renderRows(ADDRESS_ROWS)}</List.Section>
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {flex: 1},

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

ProfileRow.displayName = 'ProfileRow';

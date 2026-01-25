import React, {memo, useCallback} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useRouter, type Href} from 'expo-router';
import {Surface, Avatar, List, type ListItemProps} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, getInitials, formatDate} from '@/utils';
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

type LeftProps = Parameters<NonNullable<ListItemProps['left']>>[0];
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
    const router = useRouter();

    const onPress = useCallback(() => {
      router.push(href);
    }, [router, href]);

    const renderRight = useCallback(
      (props: RightProps) => <List.Icon {...props} icon="chevron-right" />,
      [],
    );

    return (
      <List.Item
        title={title}
        description={valueText}
        right={renderRight}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        {...descriptionProps}
        style={{paddingRight: 8}}
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
    (props: LeftProps) => (
      <Avatar.Text
        label={initials}
        accessibilityLabel={`${displayName} avatar`}
        style={props.style}
      />
    ),
    [displayName, initials],
  );
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={styles.surface} mode="flat">
        <List.Item
          title={<ThemedText variant="title1">{displayName}</ThemedText>}
          description={
            <ThemedText variant="caption">
              {roleText} • Since {memberSince}
            </ThemedText>
          }
          left={renderAvatar}
        />
      </Surface>

      <Surface style={styles.sectionSurface} elevation={1} mode="flat">
        {PERSONAL_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} />
        ))}
      </Surface>

      <Surface style={styles.sectionSurface} elevation={1} mode="flat">
        {CONTACT_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} />
        ))}
        {ADDRESS_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} />
        ))}
      </Surface>
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {flex: 1},
      contentContainer: {gap: ds.spacing.lg},

      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },

      sectionSurface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

ProfileRow.displayName = 'ProfileRow';

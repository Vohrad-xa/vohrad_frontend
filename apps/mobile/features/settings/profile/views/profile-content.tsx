import React, {memo, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useRouter, type Href} from 'expo-router';
import {Surface, Avatar, List} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {
  makeStyleFactory,
  getInitials,
  formatDate,
  AppIcons,
  Icon,
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

function ChevronRight() {
  return (
    <Icon
      name={AppIcons.actions.forward}
      colorToken="muted"
      fontWeight="regular"
    />
  );
}

const ProfileRow = memo(
  ({
    title,
    valueText,
    a11yLabel,
    a11yHint,
    href,
    descriptionProps,
    style,
  }: ProfileRowModel & {style?: StyleProp<ViewStyle>}) => {
    const router = useRouter();

    const onPress = useCallback(() => {
      router.push(href);
    }, [router, href]);

    const renderRight = useCallback(() => <ChevronRight />, []);

    return (
      <List.Item
        style={style}
        title={title}
        description={valueText}
        right={renderRight}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        {...descriptionProps}
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
    {
      ...PROFILE_FIELDS.name,
      valueText: displayName,
    },
    {
      ...PROFILE_FIELDS.dateOfBirth,
      valueText: birthDateText,
    },
  ] as const satisfies ReadonlyArray<Omit<ProfileRowModel, 'descriptionProps'>>;

  const CONTACT_ROWS = [
    {
      ...PROFILE_FIELDS.email,
      valueText: emailText,
    },
    {
      ...PROFILE_FIELDS.phoneNumber,
      valueText: phoneText,
    },
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={styles.surface} mode="flat">
        <Avatar.Text
          label={initials}
          accessibilityLabel={`${displayName} avatar`}
        />
        <ThemedText>{roleText}</ThemedText>
        <ThemedText variant="footnote">Since {memberSince}</ThemedText>
      </Surface>

      <Surface style={styles.sectionSurface} elevation={1} mode="flat">
        {PERSONAL_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} style={styles.listItem} />
        ))}
      </Surface>

      <Surface style={styles.sectionSurface} elevation={1} mode="flat">
        {CONTACT_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} style={styles.listItem} />
        ))}
        {ADDRESS_ROWS.map((row) => (
          <ProfileRow key={row.href} {...row} style={styles.listItem} />
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
        paddingVertical: ds.spacing.md,
        gap: ds.spacing.sm,
        borderRadius: ds.borderRadius.xxxl,
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      },
      sectionSurface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
      listItem: {
        paddingRight: ds.spacing.sm,
        paddingTop: ds.spacing.xs,
        paddingBottom: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

ProfileRow.displayName = 'ProfileRow';

import React, {useCallback} from 'react';
import {router, type Href} from 'expo-router';
import {Palette} from '@/constants';
import {
  Host,
  List,
  Section,
  VStack,
  HStack,
  ZStack,
  Text,
  Circle,
  Button,
  Label,
  Spacer,
  foregroundStyle,
  listRowBackground,
  listSectionMargins,
  frame,
  font,
  padding,
  buttonStyle,
  accessibilityLabel,
  accessibilityHint,
  tint,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {getInitials, formatDate, AppIcons, Icon, type IconName} from '@/utils';
import {useProfile} from '../hooks';
import {PROFILE_FIELDS} from '../constants/profile-constants';

type SystemImageName = IconName;

type ProfileRowModel = Readonly<{
  title: string;
  systemImage?: SystemImageName;
  valueText?: string;
  valuePaddingX?: number;
  trailingIcon?: React.ReactNode;
  a11yLabel: string;
  a11yHint?: string;
  href: Href;
}>;

const CONTACT_ROWS = [
  {
    ...PROFILE_FIELDS.email,
    systemImage: 'envelope' as const,
  },
  {
    ...PROFILE_FIELDS.phoneNumber,
    systemImage: 'phone' as const,
  },
  {
    ...PROFILE_FIELDS.password,
    systemImage: 'key.horizontal' as const,
  },
] as const satisfies readonly ProfileRowModel[];

const ADDRESS_ROWS = [
  {
    ...PROFILE_FIELDS.address,
    systemImage: 'building.2' as const,
  },
] as const satisfies readonly ProfileRowModel[];

function ChevronRight() {
  return (
    <Icon
      useSwiftUI
      name={AppIcons.actions.forward}
      colorToken="muted"
      fontWeight="regular"
      size={12}
    />
  );
}

const ProfileRow = React.memo(
  ({
    title,
    systemImage,
    valueText,
    valuePaddingX,
    trailingIcon,
    a11yLabel,
    a11yHint,
    href,
  }: ProfileRowModel) => {
    const onPress = useCallback(() => {
      router.push(href);
    }, [href]);

    return (
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle('automatic'),
          tint('primary'),
          accessibilityLabel(a11yLabel),
          ...(a11yHint ? [accessibilityHint(a11yHint)] : []),
        ]}
      >
        <HStack alignment="center">
          <Label systemImage={systemImage} title={title} />
          <Spacer />

          {valueText ? (
            <Text
              modifiers={[
                foregroundStyle({
                  styleType: 'hierarchical',
                  hierarchicalStyle: 'secondary',
                }),
                ...(valuePaddingX != null
                  ? [padding({horizontal: valuePaddingX})]
                  : []),
              ]}
            >
              {valueText}
            </Text>
          ) : null}
          {trailingIcon}
          <ChevronRight />
        </HStack>
      </Button>
    );
  },
);

export function ProfileContent() {
  const {ds} = useTheme();
  const {profileDetails, fullName, dateOfBirth, pendingEmail} = useProfile();

  const initials = getInitials(fullName) ?? 'U';
  const roleText = profileDetails?.role ?? 'member';
  const memberSinceText = profileDetails?.created_at
    ? formatDate(profileDetails.created_at)
    : '—';
  const birthDateText = dateOfBirth ? formatDate(dateOfBirth) : 'Not set';

  const valuePaddingX = ds.spacing.sm;

  const pendingIcon = pendingEmail ? (
    <Icon
      useSwiftUI
      name={AppIcons.status.pending}
      color={Palette.orange}
      size="xs"
      modifiers={[padding({trailing: ds.spacing.sm})]}
    />
  ) : undefined;

  return (
    <Host style={{flex: 1}}>
      <List listStyle="insetGrouped" selectionMode="none">
        {/* Profile Header */}
        <Section
          modifiers={[
            listRowBackground('clear'),
            listSectionMargins({vertical: 0}),
          ]}
        >
          <VStack
            alignment="center"
            spacing={ds.spacing.lg}
            modifiers={[
              frame({maxWidth: ds.screen.width, alignment: 'center'}),
            ]}
          >
            <ZStack alignment="center">
              <Circle
                modifiers={[
                  frame({width: 100, height: 100}),
                  foregroundStyle({
                    styleType: 'linearGradient',
                    colors: [Palette.blue, Palette.deepblue],
                    startPoint: {x: 0.08, y: 0.4},
                    endPoint: {x: 0.5, y: 0.8},
                  }),
                ]}
              />

              <Text
                modifiers={[
                  foregroundStyle({styleType: 'color', color: 'white'}),
                  font({
                    textStyle: 'largeTitle',
                    weight: 'semibold',
                  }),
                  accessibilityLabel(`Profile initials: ${initials}`),
                ]}
              >
                {initials}
              </Text>
            </ZStack>

            <Text
              modifiers={[
                font({
                  textStyle: 'title1',
                  weight: 'semibold',
                }),
              ]}
            >
              {fullName}
            </Text>

            <Text
              modifiers={[
                font({
                  textStyle: 'subheadline',
                  weight: 'medium',
                }),
                foregroundStyle('secondary'),
              ]}
            >
              Since {memberSinceText}
            </Text>

            <Text
              modifiers={[
                font({
                  textStyle: 'subheadline',
                  weight: 'medium',
                }),
                foregroundStyle('secondary'),
              ]}
            >
              {roleText}
            </Text>
          </VStack>
        </Section>

        {/* Personal Information */}
        <Section>
          <ProfileRow
            {...PROFILE_FIELDS.name}
            valueText={fullName}
            valuePaddingX={valuePaddingX}
          />

          <ProfileRow
            {...PROFILE_FIELDS.dateOfBirth}
            valueText={birthDateText}
            valuePaddingX={valuePaddingX}
          />
        </Section>

        {/* Contact Information */}
        <Section>
          {CONTACT_ROWS.map((row) => (
            <ProfileRow
              key={row.href}
              {...row}
              trailingIcon={row.title === 'Email' ? pendingIcon : undefined}
            />
          ))}
        </Section>

        {/* Address */}
        <Section>
          {ADDRESS_ROWS.map((row) => (
            <ProfileRow key={row.href} {...row} />
          ))}
        </Section>
      </List>
    </Host>
  );
}

ProfileRow.displayName = 'ProfileRow';

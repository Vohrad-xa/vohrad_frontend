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

type SystemImageName = IconName;

type ProfileRowModel = Readonly<{
  title: string;
  systemImage?: SystemImageName;
  valueText?: string;
  valuePaddingX?: number;
  a11yLabel: string;
  a11yHint?: string;
  href: Href;
}>;

const CONTACT_ROWS = [
  {
    title: 'Email',
    systemImage: 'envelope',
    a11yLabel: 'Email',
    a11yHint: 'Opens the email editor',
    href: '/(app)/(tabs)/settings/profile/email',
  },
  {
    title: 'Phone Number',
    systemImage: 'phone',
    a11yLabel: 'Phone number',
    a11yHint: 'Opens the phone number editor',
    href: '/(app)/(tabs)/settings/profile/phone',
  },
  {
    title: 'Password',
    systemImage: 'key.horizontal',
    a11yLabel: 'Change password',
    a11yHint: 'Opens the password change screen',
    href: '/(app)/(tabs)/settings/profile/password',
  },
] as const satisfies readonly ProfileRowModel[];

const ADDRESS_ROWS = [
  {
    title: 'Address',
    systemImage: 'building.2',
    a11yLabel: 'Address',
    a11yHint: 'Opens the address editor',
    href: '/(app)/(tabs)/settings/profile/address',
  },
] as const satisfies readonly ProfileRowModel[];

function ChevronRight() {
  return (
    <Icon
      useSwiftUI
      name={AppIcons.ui.chevronRight}
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

          <ChevronRight />
        </HStack>
      </Button>
    );
  },
);

export function ProfileContent() {
  const {ds} = useTheme();
  const {profileDetails, fullName, dateOfBirth} = useProfile();

  const initials = getInitials(fullName) ?? 'U';
  const roleText = profileDetails?.role ?? 'member';
  const memberSinceText = profileDetails?.created_at
    ? formatDate(profileDetails.created_at)
    : '—';
  const birthDateText = dateOfBirth ? formatDate(dateOfBirth) : 'Not set';

  const valuePaddingX = ds.spacing.sm;

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
                    size: ds.typography.ios.largeTitle.baseSize,
                    design: 'rounded',
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
                  size: ds.typography.ios.title1.baseSize,
                  weight: 'semibold',
                }),
              ]}
            >
              {fullName}
            </Text>

            <Text
              modifiers={[
                font({
                  size: ds.typography.ios.subheadline.baseSize,
                  weight: 'medium',
                }),
                foregroundStyle({
                  styleType: 'hierarchical',
                  hierarchicalStyle: 'secondary',
                }),
              ]}
            >
              Since {memberSinceText}
            </Text>

            <Text
              modifiers={[
                font({
                  size: ds.typography.ios.subheadline.baseSize,
                  weight: 'medium',
                }),
                foregroundStyle({
                  styleType: 'hierarchical',
                  hierarchicalStyle: 'secondary',
                }),
              ]}
            >
              {roleText}
            </Text>
          </VStack>
        </Section>

        {/* Personal Information */}
        <Section>
          <ProfileRow
            title="Name"
            valueText={fullName}
            valuePaddingX={valuePaddingX}
            a11yLabel={`Name, ${fullName}`}
            a11yHint="Opens the name editor"
            href="/(app)/(tabs)/settings/profile/name"
          />

          <ProfileRow
            title="Date of Birth"
            valueText={birthDateText}
            valuePaddingX={valuePaddingX}
            a11yLabel={`Date of Birth, ${birthDateText}`}
            a11yHint="Opens the date picker"
            href="/(app)/(tabs)/settings/profile/birth-date"
          />
        </Section>

        {/* Contact Information */}
        <Section>
          {CONTACT_ROWS.map((row) => (
            <ProfileRow key={row.href} {...row} />
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

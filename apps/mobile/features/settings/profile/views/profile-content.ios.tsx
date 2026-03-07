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
  frame,
  font,
  padding,
  buttonStyle,
  accessibilityLabel,
  accessibilityHint,
  tint,
  listSectionSpacing,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {getInitials, formatDate, AppIcons, Icon, type IconName} from '@/utils';
import {PROFILE_FIELDS} from '../constants/profile-constants';
import {useProfile} from '../hooks';

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
    systemImage: 'envelope' as SystemImageName,
  },
  {
    ...PROFILE_FIELDS.phoneNumber,
    systemImage: 'phone' as SystemImageName,
  },
] as const satisfies readonly ProfileRowModel[];

const ADDRESS_ROWS = [
  {
    ...PROFILE_FIELDS.address,
    systemImage: 'building.2' as SystemImageName,
  },
] as const satisfies readonly ProfileRowModel[];

function ChevronRight() {
  return (
    <Icon
      useSwiftUI
      name={AppIcons.actions.forward}
      colorToken="muted"
      fontWeight="medium"
      size={13}
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
          buttonStyle({style: 'automatic'}),
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
                foregroundStyle('secondary'),
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
  const {profileDetails, fullName, dateOfBirth} = useProfile();

  const initials = getInitials(fullName) ?? 'U';
  const roleText = profileDetails?.role_name ?? 'member';
  const memberSinceText = profileDetails?.created_at
    ? formatDate(profileDetails.created_at)
    : '—';
  const birthDateText = dateOfBirth ? formatDate(dateOfBirth) : 'Not set';

  const valuePaddingX = ds.spacing.md;

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="automatic"
        modifiers={[listSectionSpacing(ds.spacing.xl)]}
      >
        {/* Profile Header */}
        <Section>
          <HStack alignment="center" spacing={ds.spacing.lg}>
            <ZStack alignment="center">
              <Circle
                modifiers={[
                  frame({width: 70, height: 70}),
                  foregroundStyle(Palette.lightBlue),
                ]}
              />

              <Text
                modifiers={[
                  foregroundStyle(Palette.deepblue),
                  font({
                    textStyle: 'title1',
                    weight: 'medium',
                    design: 'rounded',
                  }),
                  accessibilityLabel(`Profile initials: ${initials}`),
                ]}
              >
                {initials}
              </Text>
            </ZStack>

            <VStack alignment="leading">
              <Text
                modifiers={[
                  font({
                    textStyle: 'title2',
                    weight: 'medium',
                  }),
                ]}
              >
                {fullName}
              </Text>

              <Text
                modifiers={[
                  font({
                    textStyle: 'footnote',
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
                    textStyle: 'footnote',
                    weight: 'medium',
                  }),
                  foregroundStyle('secondary'),
                ]}
              >
                {roleText}
              </Text>
            </VStack>
          </HStack>
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

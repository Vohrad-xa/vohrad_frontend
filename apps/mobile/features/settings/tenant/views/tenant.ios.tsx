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
  buttonStyle,
  accessibilityLabel,
  accessibilityHint,
  tint,
  listSectionSpacing,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons, Icon, type IconName} from '@/utils';
import {TENANT_FIELDS} from '../constants/organization-constants';
import {useTenantDetails} from '../hooks/use-tenant-details';

type SystemImageName = IconName;

type TenantRowModel = Readonly<{
  title: string;
  systemImage?: SystemImageName;
  description?: string;
  a11yLabel: string;
  a11yHint?: string;
  href: Href;
}>;

const TENANT_ROWS = [
  {
    ...TENANT_FIELDS.info,
    systemImage: 'textformat' as SystemImageName,
  },
  {
    ...TENANT_FIELDS.license,
    systemImage: 'creditcard' as SystemImageName,
  },
  {
    ...TENANT_FIELDS.businessHours,
    systemImage: 'clock' as SystemImageName,
  },
  {
    ...TENANT_FIELDS.users,
    systemImage: 'person.2' as SystemImageName,
  },
] as const satisfies readonly TenantRowModel[];

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

const TenantRow = React.memo(
  ({title, systemImage, a11yLabel, a11yHint, href}: TenantRowModel) => {
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
          <ChevronRight />
        </HStack>
      </Button>
    );
  },
);

export function TenantDetailsContent() {
  const {ds} = useTheme();
  const {title, subtitle, avatarLabel} = useTenantDetails();

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="automatic"
        modifiers={[listSectionSpacing(ds.spacing.xl)]}
      >
        {/* Tenant Header */}
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
                  accessibilityLabel(`Organization initials: ${avatarLabel}`),
                ]}
              >
                {avatarLabel}
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
                {title}
              </Text>

              {subtitle ? (
                <Text
                  modifiers={[
                    font({
                      textStyle: 'footnote',
                      weight: 'medium',
                    }),
                    foregroundStyle('secondary'),
                  ]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Section>

        {/* Tenant Menu */}
        <Section>
          {TENANT_ROWS.map((row) => (
            <TenantRow key={row.href} {...row} />
          ))}
        </Section>
      </List>
    </Host>
  );
}

TenantRow.displayName = 'TenantRow';

import React from 'react';
import {Palette} from '@/constants';
import {
  Host,
  List,
  Section,
  Text,
  VStack,
  HStack,
  ZStack,
  LabeledContent,
  foregroundStyle,
  font,
  frame,
  textSelection,
  blur,
  Image,
  Circle,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {formatDate, Icon} from '@/utils';
import {useLicenseInfo} from '../hooks/use-license-info';

export function LicenseView() {
  const {ds} = useTheme();
  const {license, seatsUsed, seatsTotal, seatsRemaining, isLicenseActive} =
    useLicenseInfo();

  const licenseKey = license?.license_key ?? '';
  const startsAt = license?.starts_at ? formatDate(license.starts_at) : '—';
  const endsAt = license?.ends_at ? formatDate(license.ends_at) : '—';

  return (
    <Host style={{flex: 1}}>
      <List listStyle="automatic">
        {/* Plan header */}
        <Section>
          <HStack alignment="center" spacing={ds.spacing.lg}>
            <ZStack alignment="center">
              <Circle
                modifiers={[
                  frame({width: 70, height: 70}),
                  foregroundStyle(Palette.lightBlue),
                ]}
              />
              <Icon
                useSwiftUI
                name="creditcard"
                color={Palette.deepblue}
                size="xl"
              />
            </ZStack>

            <VStack alignment="leading" spacing={ds.spacing.xs}>
              <Text modifiers={[font({textStyle: 'title3'})]}>
                {license?.name ?? '—'}
              </Text>

              <Text
                modifiers={[
                  font({textStyle: 'subheadline'}),
                  foregroundStyle(Palette.red),
                ]}
              >
                Expires {endsAt}
              </Text>
              <Text
                modifiers={[
                  font({textStyle: 'subheadline', weight: 'semibold'}),
                  foregroundStyle('secondary'),
                ]}
              >
                {isLicenseActive ? 'Active' : 'Inactive'}
              </Text>
            </VStack>
          </HStack>
        </Section>

        <Section title="License Details">
          <LabeledContent label="Seats Used">
            <Text modifiers={[foregroundStyle('secondary')]}>
              {seatsUsed ?? 0} of {seatsTotal ?? 0}
            </Text>
          </LabeledContent>

          <LabeledContent label="Available Seats">
            <Text modifiers={[foregroundStyle('secondary')]}>
              {seatsRemaining ?? 0}
            </Text>
          </LabeledContent>

          <LabeledContent label="Start Date">
            <Text>{startsAt}</Text>
          </LabeledContent>

          <LabeledContent label="End Date">
            <Text>{endsAt}</Text>
          </LabeledContent>
        </Section>

        <Section
          title="License Key"
          footer={
            <Text>
              Renewals are handled through external billing providers. 15 days
              before the license expires, a renewal email will be sent to the
              organization&apos;s email address.
            </Text>
          }
        >
          <HStack>
            <Text
              lineLimit={1}
              modifiers={[
                foregroundStyle('secondary'),
                textSelection(true),
                blur(3),
              ]}
            >
              {licenseKey}
            </Text>
            <Image
              systemName="doc.on.doc"
              modifiers={[foregroundStyle('secondary')]}
            />
          </HStack>
        </Section>
      </List>
    </Host>
  );
}

import React, {useCallback} from 'react';
import {router, type Href} from 'expo-router';
import {
  Host,
  List,
  Section,
  Text,
  Button,
  LabeledContent,
  foregroundStyle,
  buttonStyle,
  accessibilityLabel,
  tint,
  listSectionSpacing,
} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils';

const APP_VERSION = '0.0.1';

type HelpRowModel = Readonly<{
  label: string;
  a11yLabel: string;
  href: Href;
}>;

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

const HelpRow = React.memo(({label, a11yLabel, href}: HelpRowModel) => {
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
      ]}
    >
      <LabeledContent label={label}>
        <ChevronRight />
      </LabeledContent>
    </Button>
  );
});

HelpRow.displayName = 'HelpRow';

export function HelpContent() {
  const {ds} = useTheme();

  return (
    <Host style={{flex: 1}}>
      <List
        listStyle="automatic"
        modifiers={[listSectionSpacing(ds.spacing.xl)]}
      >
        <Section>
          <HelpRow
            label="Contact Us"
            a11yLabel="Contact Us"
            href="/(tabs)/settings/help"
          />
          <HelpRow
            label="Services and Products"
            a11yLabel="Services and Products"
            href="/(tabs)/settings/about"
          />
        </Section>

        <Section title="About Sykamore">
          <LabeledContent label="Version">
            <Text modifiers={[foregroundStyle('secondary')]}>{APP_VERSION}</Text>
          </LabeledContent>
        </Section>
      </List>
    </Host>
  );
}

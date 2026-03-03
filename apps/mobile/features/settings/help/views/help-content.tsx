import {ScrollView} from 'react-native';
import {List} from 'react-native-paper';
import {ListRows, type ListRowProps} from '@/components/ui';

const APP_VERSION = '0.0.1';

const HELP_ROWS = [
  {
    href: '/(tabs)/settings/help',
    title: 'Contact Us',
    a11yLabel: 'Contact Us',
    a11yHint: 'Navigate to contact us page',
  },
  {
    href: '/(tabs)/settings/about',
    title: 'Services and Products',
    a11yLabel: 'Services and Products',
    a11yHint: 'Navigate to services and products page',
  },
] as const satisfies readonly ListRowProps[];

const ABOUT_ROWS = [
  {
    rowKey: 'version',
    title: 'Version',
    description: APP_VERSION,
    a11yLabel: 'App version',
    a11yHint: 'Displays the current app version',
  },
] as const satisfies readonly ListRowProps[];

export function HelpContent() {
  return (
    <ScrollView style={{flex: 1, padding: 16}}>
      <List.Section>
        <ListRows rows={HELP_ROWS} />
      </List.Section>

      <List.Section title="About Sykamore">
        <ListRows rows={ABOUT_ROWS} />
      </List.Section>
    </ScrollView>
  );
}

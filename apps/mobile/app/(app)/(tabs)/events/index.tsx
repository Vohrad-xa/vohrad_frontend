import {StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {Host, List, Button, Section} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function EventsPage() {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return (
    <>
      <Stack.Screen options={{title: 'Events'}} />

      <Host style={{flex: 1}}>
        <List>
          <Section title="section">
            <Button onPress={() => {}}>Button</Button>
          </Section>
        </List>
      </Host>
    </>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.lg,
      },
      textMarginTop: {
        marginTop: ds.spacing.lg,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);

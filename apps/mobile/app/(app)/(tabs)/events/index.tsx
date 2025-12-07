import {StyleSheet, Alert} from 'react-native';
import {Stack} from 'expo-router';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {Host, List, Button, Section} from '@/modules/sykamore-ui';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function EventsPage() {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  const handleSwipeAction = (actionId: string, label: string) => {
    Alert.alert('Swipe Action', `Action: ${actionId} (${label})`);
  };

  return (
    <>
      <Stack.Screen options={{title: 'Events'}} />

      <Host style={{flex: 1}}>
        <List
          trailingSwipeActions={{
            actions: [
              {
                id: 'delete',
                label: 'Delete',
                systemImage: 'trash',
                role: 'destructive',
              },
              {id: 'flag', label: 'Flag', systemImage: 'flag'},
            ],
            allowsFullSwipe: true,
          }}
          leadingSwipeActions={{
            actions: [
              {id: 'pin', label: 'Pin', systemImage: 'pin.fill'},
              {id: 'unread', label: 'Unread', systemImage: 'envelope.badge'},
            ],
          }}
          onSwipeAction={handleSwipeAction}
        >
          <Section title="Events">
            <Button onPress={() => {}}>Event 1</Button>
            <Button onPress={() => {}}>Event 2</Button>
            <Button onPress={() => {}}>Event 3</Button>
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

import {StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function LocationsPage() {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return (
    <>
      <Stack.Screen options={{title: 'Locations'}} />
      <RefreshableScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ThemedView style={styles.container}>
          <ThemedText variant="pageTitle">Locations</ThemedText>
          <ThemedText variant="body" style={styles.textMarginTop}>
            Manage storage locations, rooms, and assigned areas here.
          </ThemedText>
        </ThemedView>
      </RefreshableScrollView>
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

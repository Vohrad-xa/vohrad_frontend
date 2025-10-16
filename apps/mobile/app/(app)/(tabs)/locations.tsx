import {StyleSheet} from 'react-native';
import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function LocationsPage() {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return (
    <RefreshableScrollView
      bounces
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scrollView}
    >
      <ThemedView style={styles.container}>
        <ThemedText variant="pageTitle">Locations</ThemedText>
        <ThemedText variant="body" style={styles.textMarginTop}>
          Manage storage locations, rooms, and assigned areas here.
        </ThemedText>
      </ThemedView>
    </RefreshableScrollView>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      scrollView: {
        backgroundColor: theme.background,
      },
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

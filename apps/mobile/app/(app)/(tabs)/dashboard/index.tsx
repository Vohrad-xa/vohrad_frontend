import {useCallback} from 'react';
import {
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {useDashboardOverview, useFetchUserProfile} from '@vohrad/store';
import {router} from 'expo-router';
import {RefreshableScrollView, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {OverviewCards, QuickActions} from '@/features/dashboard';
import {useHaptic, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const {width: screenWidth} = useWindowDimensions();
  const styles = createStyles(ds, theme);
  const {triggerHaptic} = useHaptic();
  const {fetchOverview} = useDashboardOverview();
  const {fetchUserProfile} = useFetchUserProfile();

  const handlePresentModal = useCallback(() => {
    triggerHaptic('light');
    router.push('/dashboard/cards-filter');
  }, [triggerHaptic]);

  const handleScanOpen = useCallback(() => {
    triggerHaptic('light');
    router.push('/scan');
  }, [triggerHaptic]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchUserProfile(), fetchOverview()]);
  }, [fetchUserProfile, fetchOverview]);

  const ScrollComponent =
    Platform.OS === 'web' ? ScrollView : RefreshableScrollView;

  return (
    <>
      <ScrollComponent
        bounces={Platform.OS !== 'web'}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={
          Platform.OS !== 'web' ? 'automatic' : undefined
        }
        style={styles.scrollView}
        onRefresh={Platform.OS !== 'web' ? handleRefresh : undefined}
      >
        <ThemedView style={styles.container}>
          <QuickActions onScanPress={handleScanOpen} />
          <OverviewCards
            onFilterPress={handlePresentModal}
            screenWidth={screenWidth}
          />
        </ThemedView>
      </ScrollComponent>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      scrollView: {
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.background,
        flex: 1,
      } as ViewStyle,
      container: {
        padding: ds.layout.screenPadding,
      } as ViewStyle,
      titleNoMarginTop: {
        marginTop: 0,
        marginBottom: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

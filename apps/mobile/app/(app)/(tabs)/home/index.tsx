import {useCallback} from 'react';
import {
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {userApi} from '@vohrad/api-client';
import {useAuthStore, type StoreState} from '@vohrad/store';
import {router} from 'expo-router';
import {RefreshableScrollView, ThemedText, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {OverviewCards} from '@/features/home/overview/overview-cards';
import {QuickActions} from '@/features/home/quick-actions';
import {useHaptic, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const {width: screenWidth} = useWindowDimensions();
  const styles = createStyles(ds, theme);
  const setUser = useAuthStore((state: StoreState) => state.setUser);
  const {triggerHaptic} = useHaptic();

  const handlePresentModal = useCallback(() => {
    triggerHaptic('light');
    router.push('/filter');
  }, [triggerHaptic]);

  const handleScanOpen = useCallback(() => {
    triggerHaptic('light');
    router.push('/scan');
  }, [triggerHaptic]);

  const handleRefresh = async () => {
    try {
      const updatedUser = await userApi.getUserProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

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
          <ThemedText variant="heading" style={styles.titleNoMarginTop}>
            Quick Actions
          </ThemedText>
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

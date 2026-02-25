import {useCallback, useLayoutEffect, useRef} from 'react';
import {
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import {useDashboardOverview, useFetchUserProfile} from '@sykamore/store';
import {router, useNavigation} from 'expo-router';
import {HeaderButton, RefreshableScrollView, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  OverviewCards,
  QuickActions,
  CardsFilterSheet,
  type CardsFilterSheetHandle,
} from '@/features/dashboard';
import {useHaptic, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const navigation = useNavigation();
  const {width: screenWidth} = useWindowDimensions();
  const styles = createStyles(ds, theme);
  const {triggerHaptic} = useHaptic();
  const {refetch: refetchOverview} = useDashboardOverview();
  const {refetch: refetchUserProfile} = useFetchUserProfile();
  const filterSheetRef = useRef<CardsFilterSheetHandle>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          variant={Platform.OS === 'ios' ? 'more' : 'filter'}
          accessibilityLabel="Filter dashboard cards"
          onPress={() => {
            void filterSheetRef.current?.present();
          }}
          style={{
            backgroundColor: Platform.OS === 'ios' ? undefined : theme.ripple,
          }}
        />
      ),
    });
  }, [navigation, theme]);

  const handleScanOpen = useCallback(() => {
    triggerHaptic('light');
    router.push('/dashboard/scan');
  }, [triggerHaptic]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchUserProfile(), refetchOverview()]);
  }, [refetchUserProfile, refetchOverview]);

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
          <OverviewCards screenWidth={screenWidth} />
        </ThemedView>
      </ScrollComponent>
      <CardsFilterSheet ref={filterSheetRef} />
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      scrollView: {
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

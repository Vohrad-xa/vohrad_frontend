import {useCallback, useLayoutEffect, useRef} from 'react';
import {StyleSheet, ScrollView, Platform, View} from 'react-native';
import {useDashboardOverview} from '@sykamore/store';
import {router, useNavigation} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  OverviewCards,
  QuickActions,
  CardsFilterSheet,
  type CardsFilterSheetHandle,
} from '@/features/dashboard';
import {usePullToRefresh} from '@/hooks';
import {useHaptic, useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function HomeScreen() {
  const {ds, theme} = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {triggerHaptic} = useHaptic();
  const {refetch: refetchOverview} = useDashboardOverview();
  const filterSheetRef = useRef<CardsFilterSheetHandle>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          variant="filter"
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

  const {refreshControl} = usePullToRefresh({
    onRefresh: async () => {
      await refetchOverview();
    },
  });

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        refreshControl={refreshControl}
      >
        <View style={styles.container}>
          <QuickActions onScanPress={handleScanOpen} />
          <OverviewCards />
        </View>
      </ScrollView>
      <CardsFilterSheet ref={filterSheetRef} />
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      scrollView: {
        flex: 1,
      },
      container: {
        padding: ds.layout.screenPadding,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

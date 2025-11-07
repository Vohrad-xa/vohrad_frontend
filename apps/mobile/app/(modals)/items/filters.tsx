import {useCallback, useEffect, useRef, useState} from 'react';
import {useSetPendingFilters, useItemFiltersManager} from '@vohrad/store';
import {type ItemFilterState} from '@vohrad/types';
import {Stack, useRouter, useLocalSearchParams} from 'expo-router';
import {HeaderButton, ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  PriceRangeFilter,
  StatusFilter,
  TrackingModeFilter,
} from '@/features/item';
import {useTheme} from '@/providers';
import {triggerHaptic, makeStyleFactory} from '@/utils';

export default function ItemFiltersModal() {
  const router = useRouter();
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const setPendingFilters = useSetPendingFilters();

  // Get initial filters
  const params = useLocalSearchParams<{
    initialFilters?: string;
  }>();

  // Parse initial filters
  const initialFilters = params.initialFilters
    ? (JSON.parse(decodeURIComponent(params.initialFilters)) as ItemFilterState)
    : {};

  const {filters, toggleFilter, updatePriceMin, updatePriceMax} =
    useItemFiltersManager(initialFilters);
  const [hasChanges, setHasChanges] = useState(false);
  const previousFiltersRef = useRef<string | undefined>(undefined);

  // Check if filters have changed
  useEffect(() => {
    const currentFilterString = JSON.stringify(filters);

    // Skip initial render
    if (previousFiltersRef.current === undefined) {
      previousFiltersRef.current = currentFilterString;
      return;
    }

    // Check
    setHasChanges(previousFiltersRef.current !== currentFilterString);
  }, [filters]);

  const handleSave = useCallback(() => {
    if (hasChanges) {
      triggerHaptic('light');
      setPendingFilters(filters);
      router.back();
    } else {
      router.back();
    }
  }, [filters, hasChanges, router, setPendingFilters]);

  const handleReset = useCallback(() => {
    triggerHaptic('light');
    setPendingFilters({});
    router.back();
  }, [router, setPendingFilters]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderButton
              variant="cancel"
              text="Reset"
              onPress={handleReset}
              accessibilityLabel="Reset filters"
            />
          ),
          headerRight: () => (
            <HeaderButton
              variant="save"
              onPress={handleSave}
              accessibilityLabel="Save filters"
            />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ModalScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <StatusFilter
            statuses={filters.statuses ?? []}
            toggleStatus={(status) => toggleFilter('statuses', status)}
          />

          <TrackingModeFilter
            trackingModes={filters.trackingModes ?? []}
            toggleTrackingMode={(mode) => toggleFilter('trackingModes', mode)}
          />

          <PriceRangeFilter
            priceMin={filters.priceMin ?? null}
            priceMax={filters.priceMax ?? null}
            onMinChange={updatePriceMin}
            onMaxChange={updatePriceMax}
          />
        </ModalScrollView>
      </ThemedView>
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => ({
    container: {
      flex: 1,
      backgroundColor: theme.secondbackground,
    },
    content: {
      padding: ds.spacing.lg,
      gap: ds.spacing.xl,
    },
  }),
  (ds, theme) => themeKey(theme, ds),
);

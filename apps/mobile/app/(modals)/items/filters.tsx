import {useCallback, useEffect, useRef, useState} from 'react';
import {useSetPendingFilters, useItemFiltersManager} from '@sykamore/store';
import {type ItemFilterState} from '@sykamore/types';
import {Stack, useRouter, useLocalSearchParams} from 'expo-router';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  PriceRangeFilter,
  StatusFilter,
  TrackingModeFilter,
} from '@/features/item';
import {useTheme} from '@/providers';
import {triggerHaptic, makeStyleFactory} from '@/utils';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

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
        options={getHeaderOptions({
          right: [
            {
              key: 'reset',
              label: 'Reset Filters',
              iosSymbol: 'arrow.counterclockwise',
              icon: 'restore',
              onPress: handleReset,
            },
            {
              key: 'save',
              label: 'Save Filters',
              iosSymbol: 'checkmark',
              icon: 'content-save',
              variant: 'prominent',
              onPress: handleSave,
            },
          ],
          left: [
            {
              key: 'close',
              label: 'Close',
              iosSymbol: 'xmark',
              icon: 'arrow-left',
              onPress: () => router.back(),
            },
          ],
        })}
      />
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
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) => ({
    content: {
      padding: ds.spacing.lg,
      gap: ds.spacing.xl,
    },
  }),
  (ds, theme) => themeKey(theme, ds),
);

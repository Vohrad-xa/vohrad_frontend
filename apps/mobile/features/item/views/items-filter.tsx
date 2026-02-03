import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import Slider from '@react-native-community/slider';
import {
  IconButton,
  List,
  Switch as PaperSwitch,
  Tooltip,
} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {triggerHaptic} from '@/utils';
import {Switch as AndroidSwitch} from 'sykamore-ui/android';
import {DEFAULT_ITEM_FILTERS, useItemFilters} from '../hooks';
import type {ItemFilterState} from '@sykamore/types';

type StatusValue = NonNullable<ItemFilterState['statuses']>[number];
type TrackingValue = NonNullable<ItemFilterState['trackingModes']>[number];

type ToggleRowModel = Readonly<{
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}>;

const STATUS_FILTERS = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
] as const satisfies ReadonlyArray<{label: string; value: StatusValue}>;

const TRACKING_FILTERS = [
  {label: 'Abstract', value: 'abstract'},
  {label: 'Lot', value: 'lot'},
  {label: 'Serialized', value: 'serialized'},
] as const satisfies ReadonlyArray<{label: string; value: TrackingValue}>;

const ToggleRow = memo(({label, checked, onToggle}: ToggleRowModel) => {
  const renderRight = useCallback(
    () =>
      Platform.OS === 'android' ? (
        <AndroidSwitch
          value={checked}
          onValueChange={onToggle}
          scale={0.85}
          elementColors={{checkedTrackColor: Palette.bluepurple}}
        />
      ) : (
        <PaperSwitch value={checked} onValueChange={onToggle} />
      ),
    [checked, onToggle],
  );

  return <List.Item title={label} right={renderRight} style={styles.row} />;
});

ToggleRow.displayName = 'ToggleRow';

export type ItemsFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

type ItemsFilterSheetProps = {
  initialFilters: ItemFilterState;
};

export const ItemsFilterSheet = forwardRef<
  ItemsFilterSheetHandle,
  ItemsFilterSheetProps
>(({initialFilters}, ref) => {
  const {theme} = useTheme();
  const sheetRef = useRef<TrueSheet>(null);

  const {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    setFilters,
    resetFilters,
    saveFilters,
  } = useItemFilters();

  const {statuses = [], trackingModes = []} = filters;

  const handlePresent = useCallback(async () => {
    setFilters(initialFilters);
    await sheetRef.current?.present();
  }, [initialFilters, setFilters]);

  const handleDismiss = useCallback(async () => {
    await sheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      present: handlePresent,
      dismiss: handleDismiss,
    }),
    [handlePresent, handleDismiss],
  );

  const handleSave = useCallback(() => {
    saveFilters();
    void sheetRef.current?.dismiss();
  }, [saveFilters]);

  const handleReset = useCallback(() => {
    triggerHaptic('light');
    resetFilters();
    saveFilters(DEFAULT_ITEM_FILTERS);
    void sheetRef.current?.dismiss();
  }, [resetFilters, saveFilters]);

  const statusRows = useMemo<ToggleRowModel[]>(
    () =>
      STATUS_FILTERS.map((status) => ({
        id: `status-${status.value}`,
        label: status.label,
        checked: statuses.includes(status.value),
        onToggle: () => toggleFilter('statuses', status.value),
      })),
    [statuses, toggleFilter],
  );

  const trackingRows = useMemo<ToggleRowModel[]>(
    () =>
      TRACKING_FILTERS.map((tracking) => ({
        id: `tracking-${tracking.value}`,
        label: tracking.label,
        checked: trackingModes.includes(tracking.value),
        onToggle: () => toggleFilter('trackingModes', tracking.value),
      })),
    [trackingModes, toggleFilter],
  );

  const toggleRows = useMemo(
    () => [...statusRows, ...trackingRows],
    [statusRows, trackingRows],
  );

  const priceMinLabel = filters.priceMin?.toFixed(2) ?? '0.00';
  const priceMaxLabel = filters.priceMax?.toFixed(2) ?? '10000.00';

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.7, 1]}
      backgroundColor={
        Platform.OS === 'android' ? theme.modalBackground : undefined
      }
      cornerRadius={Platform.OS === 'android' ? 30 : undefined}
      scrollable
      role="form"
      header={
        <View>
          <List.Item
            title="Item Filters"
            style={{paddingRight: 0}}
            right={() => (
              <View style={styles.headerContainer}>
                <Tooltip title="Reset filters">
                  <IconButton
                    icon="restore"
                    onPress={handleReset}
                    accessibilityLabel="Reset item filters"
                  />
                </Tooltip>
                <Tooltip title="Save filters">
                  <IconButton
                    icon="check"
                    onPress={handleSave}
                    accessibilityLabel="Save item filters"
                  />
                </Tooltip>
              </View>
            )}
          />
        </View>
      }
      headerStyle={styles.header}
    >
      <List.Section>
        {toggleRows.map((row) => (
          <ToggleRow key={row.id} {...row} />
        ))}
      </List.Section>

      <View>
        <List.Subheader>Minimum: ${priceMinLabel}</List.Subheader>
        <Slider
          minimumTrackTintColor={Palette.bluepurple}
          thumbTintColor={Palette.bluepurple}
          value={filters.priceMin ?? 0}
          onValueChange={updatePriceMin}
          minimumValue={0}
          maximumValue={filters.priceMax ?? 10000}
          step={10}
        />

        <List.Subheader>Maximum: ${priceMaxLabel}</List.Subheader>
        <Slider
          minimumTrackTintColor={Palette.bluepurple}
          thumbTintColor={Palette.bluepurple}
          value={filters.priceMax ?? 10000}
          onValueChange={updatePriceMax}
          minimumValue={filters.priceMin ?? 0}
          maximumValue={10000}
          step={10}
        />
      </View>
    </TrueSheet>
  );
});

ItemsFilterSheet.displayName = 'ItemsFilterSheet';

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    paddingTop: 8,
  },
  headerContainer: {
    flexDirection: 'row',
  },
  row: {
    paddingVertical: 0,
    paddingRight: 12,
  },
});

export default ItemsFilterSheet;

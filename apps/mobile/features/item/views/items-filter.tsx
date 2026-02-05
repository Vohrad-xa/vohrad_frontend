import React, {forwardRef, memo, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import Slider from '@react-native-community/slider';
import {Appbar, Divider, List, Surface, Switch} from 'react-native-paper';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';
import {useEditFilter} from '../hooks';
import type {ItemFilterState} from '@sykamore/types';

type ToggleRowModel = {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
};

type PriceRowModel = {
  id: string;
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

type ItemsFilterSheetProps = {
  initialFilters: ItemFilterState;
};

type ItemsFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

const ToggleRow = memo(({label, checked, onToggle}: ToggleRowModel) => {
  const {ds, theme} = useTheme();

  return (
    <List.Item
      title={label}
      right={() => <Switch value={checked} onValueChange={onToggle} />}
      borderless
      style={{borderRadius: ds.borderRadius.xs, backgroundColor: theme.card}}
    />
  );
});

ToggleRow.displayName = 'ToggleRow';

const PriceRow = memo(
  ({label, valueLabel, value, min, max, onChange}: PriceRowModel) => {
    const {ds, theme} = useTheme();

    return (
      <List.Item
        title={`${label}: ${valueLabel}`}
        description={() => (
          <Slider
            minimumTrackTintColor={Palette.bluepurple}
            thumbTintColor={Palette.bluepurple}
            value={value}
            onValueChange={onChange}
            minimumValue={min}
            maximumValue={max}
            style={{marginTop: ds.spacing.sm}}
          />
        )}
        borderless
        style={{borderRadius: ds.borderRadius.xs, backgroundColor: theme.card}}
      />
    );
  },
);

PriceRow.displayName = 'PriceRow';

export const ItemsFilterSheet = forwardRef<
  ItemsFilterSheetHandle,
  ItemsFilterSheetProps
>(({initialFilters}, ref) => {
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    sheetRef,
    filters,
    statusRows,
    trackingRows,
    priceMinLabel,
    priceMaxLabel,
    updatePriceMin,
    updatePriceMax,
    handleSave,
    handleReset,
  } = useEditFilter({initialFilters, sheetHandleRef: ref});

  const priceRows = useMemo<PriceRowModel[]>(
    () => [
      {
        id: 'price-min',
        label: 'Minimum',
        valueLabel: priceMinLabel,
        value: filters.priceMin ?? 0,
        min: 0,
        max: filters.priceMax ?? 10000,
        onChange: updatePriceMin,
      },
      {
        id: 'price-max',
        label: 'Maximum',
        valueLabel: priceMaxLabel,
        value: filters.priceMax ?? 10000,
        min: filters.priceMin ?? 0,
        max: 10000,
        onChange: updatePriceMax,
      },
    ],
    [
      filters.priceMin,
      filters.priceMax,
      priceMinLabel,
      priceMaxLabel,
      updatePriceMin,
      updatePriceMax,
    ],
  );

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.85, 1]}
      backgroundColor={theme.modalBackground}
      style={styles.container}
      role="form"
      header={
        <Appbar.Header
          statusBarHeight={ds.layout.screenPadding}
          style={styles.header}
        >
          <Appbar.Content title="Item Filters" />
          <Appbar.Action
            icon={AppIcons.actions.refresh}
            onPress={handleReset}
            accessibilityLabel="Reset item filters"
          />
          <Appbar.Action
            icon={AppIcons.actions.save}
            onPress={handleSave}
            accessibilityLabel="Save item filters"
          />
        </Appbar.Header>
      }
    >
      <List.Section title="Status">
        <Surface mode="flat" style={styles.surface}>
          {statusRows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <ToggleRow {...row} />
              {idx !== statusRows.length - 1 && (
                <Divider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </Surface>
      </List.Section>

      <List.Section title="Tracking Mode">
        <Surface mode="flat" style={styles.surface}>
          {trackingRows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <ToggleRow {...row} />
              {idx !== trackingRows.length - 1 && (
                <Divider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </Surface>
      </List.Section>

      <List.Section title="Price Range">
        <Surface mode="flat" style={styles.surface}>
          {priceRows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <PriceRow {...row} />
              {idx !== priceRows.length - 1 && (
                <Divider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </Surface>
      </List.Section>
    </TrueSheet>
  );
});

ItemsFilterSheet.displayName = 'ItemsFilterSheet';

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {paddingHorizontal: ds.spacing.md},
      header: {backgroundColor: 'transparent'},
      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      },
      divider: {
        height: 1.9,
        backgroundColor: 'transparent',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default ItemsFilterSheet;

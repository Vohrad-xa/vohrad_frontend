import React, {forwardRef, memo, useMemo} from 'react';
import {Platform, ScrollView, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import Slider from '@react-native-community/slider';
import {useRouter} from 'expo-router';
import {Appbar, Button, List, Switch} from 'react-native-paper';
import {ListRow, ListRows} from '@/components/ui';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
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

const ToggleRow = memo(({id, label, checked, onToggle}: ToggleRowModel) => {
  return (
    <ListRow
      rowKey={id}
      title={label}
      a11yLabel={label}
      a11yHint={`Toggles ${label}`}
      right={() => (
        <Switch
          value={checked}
          onValueChange={onToggle}
          accessibilityLabel={`${label} toggle`}
        />
      )}
    />
  );
});
ToggleRow.displayName = 'ToggleRow';

const PriceRow = memo(
  ({id: _id, label, valueLabel, value, min, max, onChange}: PriceRowModel) => {
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
            accessibilityLabel={`${label} price slider`}
            accessibilityValue={{text: valueLabel}}
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
  const router = useRouter();
  const {theme, ds} = useTheme();

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

  const openAdvancedFilters = async () => {
    await sheetRef.current?.dismiss();
    router.push('/(modals)/items/advanced-filter');
  };

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
      detents={Platform.OS === 'web' ? [0.82, 1] : ['auto']}
      backgroundColor={theme.modalBackground}
      role="form"
      scrollable
      footer={
        <View
          style={{
            paddingHorizontal: ds.spacing.md,
            paddingVertical: ds.spacing.xxl,
          }}
        >
          <Button
            mode="contained"
            onPress={openAdvancedFilters}
            accessibilityLabel="Open advanced item filters"
            textColor={Palette.white}
          >
            Advanced Filters
          </Button>
        </View>
      }
      header={
        <Appbar.Header
          statusBarHeight={ds.spacing.md}
          style={{backgroundColor: 'transparent'}}
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
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: ds.spacing.md}}
      >
        <List.Section title="Status">
          <ListRows>
            {statusRows.map((row) => (
              <ToggleRow key={row.id} {...row} />
            ))}
          </ListRows>
        </List.Section>

        <List.Section title="Tracking Mode">
          <ListRows>
            {trackingRows.map((row) => (
              <ToggleRow key={row.id} {...row} />
            ))}
          </ListRows>
        </List.Section>

        <List.Section title="Price Range">
          <ListRows>
            {priceRows.map((row) => (
              <PriceRow key={row.id} {...row} />
            ))}
          </ListRows>
        </List.Section>
      </ScrollView>
    </TrueSheet>
  );
});
ItemsFilterSheet.displayName = 'ItemsFilterSheet';

export default ItemsFilterSheet;

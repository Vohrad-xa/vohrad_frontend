import React, {forwardRef} from 'react';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {Appbar} from 'react-native-paper';
import {
  Host,
  List,
  Section,
  Slider,
  Text,
  Toggle,
  VStack,
} from 'sykamore-ui/ios';
import {useEditFilter} from '../hooks';
import type {ItemFilterState} from '@sykamore/types';

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

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.72, 1]}
      scrollable
      role="form"
      header={
        <Appbar.Header
          statusBarHeight={0}
          style={{backgroundColor: 'transparent'}}
        >
          <Appbar.Content title="Item Filters" />
          <Appbar.Action
            icon="restore"
            onPress={handleReset}
            accessibilityLabel="Reset item filters"
          />
          <Appbar.Action
            icon="check"
            onPress={handleSave}
            accessibilityLabel="Save item filters"
          />
        </Appbar.Header>
      }
    >
      <Host style={{flex: 1}}>
        <List listStyle="automatic">
          <Section title="Status">
            {statusRows.map((row) => (
              <Toggle
                key={row.id}
                isOn={row.checked}
                onIsOnChange={row.onToggle}
                label={row.label}
              />
            ))}
          </Section>

          <Section title="Tracking Mode">
            {trackingRows.map((row) => (
              <Toggle
                key={row.id}
                isOn={row.checked}
                onIsOnChange={row.onToggle}
                label={row.label}
              />
            ))}
          </Section>

          <Section title="Price Range">
            <VStack alignment="leading" spacing={12}>
              <Text>Minimum: {priceMinLabel}</Text>
              <Slider
                value={filters.priceMin ?? 0}
                onValueChange={updatePriceMin}
                min={0}
                max={filters.priceMax ?? 10000}
              />
              <Text>Maximum: {priceMaxLabel}</Text>
              <Slider
                value={filters.priceMax ?? 10000}
                onValueChange={updatePriceMax}
                min={filters.priceMin ?? 0}
                max={10000}
              />
            </VStack>
          </Section>
        </List>
      </Host>
    </TrueSheet>
  );
});

ItemsFilterSheet.displayName = 'ItemsFilterSheet';

export default ItemsFilterSheet;

import React from 'react';
import {Platform, ScrollView, View} from 'react-native';
import {List, Switch as PaperSwitch} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {Switch as AndroidSwitch} from 'sykamore-ui/android';
import type {ItemFilterState} from '@sykamore/types';

interface ItemFiltersProps {
  filters: ItemFilterState;
  toggleFilter: <T extends keyof ItemFilterState>(
    filterName: T,
    value: ItemFilterState[T] extends Array<infer U> | undefined ? U : never,
  ) => void;
  updatePriceMin: (value: number | null) => void;
  updatePriceMax: (value: number | null) => void;
}

export function ItemFilters({
  filters,
  toggleFilter,
  updatePriceMin,
  updatePriceMax,
}: ItemFiltersProps) {
  const renderToggle = (value: boolean, onToggle: () => void) => {
    if (Platform.OS === 'android') {
      return (
        <AndroidSwitch value={value} onValueChange={onToggle} scale={0.85} />
      );
    }
    return <PaperSwitch value={value} onValueChange={onToggle} />;
  };

  return (
    <ScrollView>
      <List.Section>
        <List.Item
          title="Active"
          right={() =>
            renderToggle(filters.statuses?.includes('active') ?? false, () =>
              toggleFilter('statuses', 'active'),
            )
          }
        />
        <List.Item
          title="Inactive"
          right={() =>
            renderToggle(filters.statuses?.includes('inactive') ?? false, () =>
              toggleFilter('statuses', 'inactive'),
            )
          }
        />

        <List.Item
          title="Abstract"
          right={() =>
            renderToggle(
              filters.trackingModes?.includes('abstract') ?? false,
              () => toggleFilter('trackingModes', 'abstract'),
            )
          }
        />
        <List.Item
          title="Lot"
          right={() =>
            renderToggle(filters.trackingModes?.includes('lot') ?? false, () =>
              toggleFilter('trackingModes', 'lot'),
            )
          }
        />
        <List.Item
          title="Serialized"
          right={() =>
            renderToggle(
              filters.trackingModes?.includes('serialized') ?? false,
              () => toggleFilter('trackingModes', 'serialized'),
            )
          }
        />

        <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
          <List.Subheader>
            Minimum: ${filters.priceMin?.toFixed(2) ?? '0.00'}
          </List.Subheader>
          <Slider
            value={filters.priceMin ?? 0}
            onValueChange={updatePriceMin}
            minimumValue={0}
            maximumValue={filters.priceMax ?? 10000}
            step={5}
          />
          <List.Subheader>
            Maximum: ${filters.priceMax?.toFixed(2) ?? '10000.00'}
          </List.Subheader>
          <Slider
            value={filters.priceMax ?? 10000}
            onValueChange={updatePriceMax}
            minimumValue={filters.priceMin ?? 0}
            maximumValue={10000}
            step={10}
          />
        </View>
      </List.Section>
    </ScrollView>
  );
}

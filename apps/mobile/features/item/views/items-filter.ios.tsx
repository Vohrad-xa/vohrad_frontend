import React, {forwardRef} from 'react';
import {View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {Palette} from '@/constants';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {
  List,
  HStack,
  Host,
  Image,
  Section,
  Slider,
  Spacer,
  Text,
  Toggle,
  VStack,
  accessibilityLabel,
  font,
  foregroundStyle,
  frame,
  glassEffect,
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
  const {ds} = useTheme();
  const {
    sheetRef,
    filters,
    statusRows,
    trackingRows,
    unitRows,
    priceMinLabel,
    priceMaxLabel,
    updatePriceMin,
    updatePriceMax,
    handleSave,
    handleReset,
  } = useEditFilter({initialFilters, sheetHandleRef: ref});

  const headerButtonSize = ds.components.tapTarget.minSize;
  const buildHeaderIconModifiers = (tintColor?: string) => [
    font({size: ds.iconSize.md, weight: 'regular'}),
    frame({width: headerButtonSize, height: headerButtonSize}),
    glassEffect(
      tintColor
        ? {shape: 'circle', glass: {tint: tintColor, interactive: true}}
        : {shape: 'circle', glass: {interactive: true}},
    ),
  ];

  const headerContent = (
    <HStack alignment="center" spacing={ds.spacing.sm}>
      <Text modifiers={[font({weight: 'medium', textStyle: 'headline'})]}>
        Item Filters
      </Text>

      <Spacer />

      <Image
        systemName={AppIcons.actions.refresh}
        onPress={handleReset}
        modifiers={[
          ...buildHeaderIconModifiers(),
          accessibilityLabel('Reset item filters'),
        ]}
      />

      <Image
        systemName={AppIcons.actions.save}
        onPress={handleSave}
        modifiers={[
          ...buildHeaderIconModifiers(Palette.orange),
          foregroundStyle(Palette.white),
          accessibilityLabel('Save item filters'),
        ]}
      />
    </HStack>
  );

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.51, 1]}
      scrollable
      role="form"
      header={
        <View>
          <Host matchContents>{headerContent}</Host>
        </View>
      }
      headerStyle={{padding: ds.spacing.lg}}
    >
      <Host style={{flex: 1}}>
        <List>
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

          <Section title="Unit of Measure">
            {unitRows.map((row) => (
              <Toggle
                key={row.id}
                isOn={row.checked}
                onIsOnChange={row.onToggle}
                label={row.label}
              />
            ))}
          </Section>

          <Section title="Price Range">
            <VStack alignment="leading" spacing={ds.spacing.md}>
              <Text
                modifiers={[font({weight: 'medium', design: 'monospaced'})]}
              >
                min {priceMinLabel}
              </Text>
              <Slider
                value={filters.priceMin ?? 0}
                onValueChange={updatePriceMin}
                min={0}
                max={filters.priceMax ?? 10000}
              />

              <Text
                modifiers={[font({weight: 'medium', design: 'monospaced'})]}
              >
                max {priceMaxLabel}
              </Text>
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

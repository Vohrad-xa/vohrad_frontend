import React, {forwardRef} from 'react';
import {Platform, View} from 'react-native';
import {TrueSheet} from '@lodev09/react-native-true-sheet';
import {useRouter} from 'expo-router';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {
  Host,
  List,
  HStack,
  VStack,
  Section,
  Text,
  Button,
  Slider,
  Toggle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityValue,
  listSectionSpacing,
  listSectionMargins,
  controlSize,
  buttonStyle,
  labelStyle,
  font,
  frame,
} from 'sykamore-ui/ios';
import {useEditFilter} from '../hooks';
import type {ItemFilterState} from '@sykamore/types';

export type ItemsFilterSheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

type ItemsFilterSheetProps = {
  initialFilters: ItemFilterState;
  onSave: (filters: ItemFilterState) => void;
};

const iconButtonModifiers = (label: string) => [
  accessibilityLabel(label),
  buttonStyle({style: 'glass', borderShape: 'circle'}),
  controlSize('large'),
  labelStyle('iconOnly'),
  font({weight: 'semibold'}),
];

const priceFont = font({weight: 'medium', design: 'monospaced'});

export const ItemsFilterSheet = forwardRef<
  ItemsFilterSheetHandle,
  ItemsFilterSheetProps
>(({initialFilters, onSave}, ref) => {
  const router = useRouter();
  const {ds} = useTheme();
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
  } = useEditFilter({initialFilters, onSave, sheetHandleRef: ref});

  const openAdvancedFilters = async () => {
    await sheetRef.current?.dismiss();
    router.push('/(modals)/items/advanced-filter');
  };

  return (
    <TrueSheet
      ref={sheetRef}
      detents={Platform.OS === 'ios' && Platform.isPad ? [0.8, 1] : [0.75, 1]}
      scrollable
      role="menu"
      footer={
        <View
          style={{
            paddingHorizontal: ds.layout.screenPadding,
            paddingVertical: ds.spacing.md,
          }}
        >
          <Host matchContents useViewportSizeMeasurement>
            <HStack alignment="center" spacing={ds.spacing.xs}>
              <Button
                label="Reset filters"
                systemImage={AppIcons.actions.refresh}
                onPress={handleReset}
                modifiers={iconButtonModifiers('Reset filters')}
              />

              <Button
                role="default"
                onPress={openAdvancedFilters}
                modifiers={[
                  accessibilityLabel('Open advanced filters'),
                  buttonStyle({style: 'glassProminent'}),
                  controlSize('large'),
                ]}
              >
                <Text
                  modifiers={[
                    frame({maxWidth: Infinity}),
                    font({
                      weight: 'semibold',
                      size: 16,
                    }),
                  ]}
                >
                  Advanced Filters
                </Text>
              </Button>

              <Button
                label="Apply filters"
                systemImage={AppIcons.actions.save}
                onPress={handleSave}
                modifiers={iconButtonModifiers('Apply filters')}
              />
            </HStack>
          </Host>
        </View>
      }
    >
      <Host style={{flex: 1}}>
        <List listStyle="sidebar" modifiers={[listSectionSpacing('compact')]}>
          <Section
            title="Status"
            isExpanded
            modifiers={[listSectionMargins({top: ds.spacing.lg})]}
          >
            {statusRows.map((row) => (
              <Toggle
                key={row.id}
                isOn={row.checked}
                onIsOnChange={row.onToggle}
                label={row.label}
                modifiers={[accessibilityLabel(row.label)]}
              />
            ))}
          </Section>

          <Section title="Tracking Mode" isExpanded>
            {trackingRows.map((row) => (
              <Toggle
                key={row.id}
                isOn={row.checked}
                onIsOnChange={row.onToggle}
                label={row.label}
                modifiers={[accessibilityLabel(row.label)]}
              />
            ))}
          </Section>

          <Section title="Price Range" isExpanded>
            <VStack alignment="leading" spacing={ds.spacing.md}>
              <Text modifiers={[priceFont]}>min {priceMinLabel}</Text>
              <Slider
                value={filters.priceMin ?? 0}
                onValueChange={updatePriceMin}
                max={filters.priceMax ?? 10000}
                min={0}
                modifiers={[
                  accessibilityLabel('Minimum price slider'),
                  accessibilityHint('Adjusts the lowest price filter.'),
                  accessibilityValue(priceMinLabel),
                ]}
              />

              <Text modifiers={[priceFont]}>max {priceMaxLabel}</Text>
              <Slider
                value={filters.priceMax ?? 10000}
                onValueChange={updatePriceMax}
                min={filters.priceMin ?? 0}
                max={10000}
                modifiers={[
                  accessibilityLabel('Maximum price slider'),
                  accessibilityHint('Adjusts the highest price filter.'),
                  accessibilityValue(priceMaxLabel),
                ]}
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

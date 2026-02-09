import React, {forwardRef} from 'react';
import {View} from 'react-native';
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
};

const iconButtonModifiers = (label: string) => [
  accessibilityLabel(label),
  buttonStyle({style: 'glass', borderShape: 'circle'}),
  controlSize('large'),
  labelStyle('iconOnly'),
];

const priceFont = font({weight: 'medium', design: 'monospaced'});

export const ItemsFilterSheet = forwardRef<
  ItemsFilterSheetHandle,
  ItemsFilterSheetProps
>(({initialFilters}, ref) => {
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
  } = useEditFilter({initialFilters, sheetHandleRef: ref});

  const openAdvancedFilters = async () => {
    await sheetRef.current?.dismiss();
    router.push('/');
  };

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.76, 1]}
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
            <HStack alignment="center" spacing={ds.spacing.sm}>
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
                  buttonStyle({style: 'glass'}),
                  controlSize('large'),
                ]}
              >
                <Text modifiers={[frame({maxWidth: Infinity})]}>
                  Advanced Filters
                </Text>
              </Button>

              <Button
                label="Save filters"
                systemImage={AppIcons.actions.save}
                onPress={handleSave}
                modifiers={iconButtonModifiers('Save basic item filters')}
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
              />

              <Text modifiers={[priceFont]}>max {priceMaxLabel}</Text>
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

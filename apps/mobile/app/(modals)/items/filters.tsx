import {useCallback, useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {Stack, useNavigation, useLocalSearchParams, router} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useItemFilters} from '@/features/item/hooks/use-item-filters';
import {ItemFilters} from '@/features/item/views/filters';
import {applyHeaderActions} from '@/utils/navigation/header-actions';
import {triggerHaptic} from '@/utils';
import type {ItemFilterState} from '@sykamore/types';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function ItemFiltersModal() {
  const navigation = useNavigation();

  const params = useLocalSearchParams<{
    initialFilters?: string;
  }>();

  const initialFilters = params.initialFilters
    ? (JSON.parse(decodeURIComponent(params.initialFilters)) as ItemFilterState)
    : {};

  const {
    filters,
    toggleFilter,
    updatePriceMin,
    updatePriceMax,
    resetFilters,
    saveFilters,
  } = useItemFilters({initialFilters});

  const handleSave = useCallback(() => {
    saveFilters();
    router.dismiss();
  }, [saveFilters]);

  const handleReset = useCallback(() => {
    triggerHaptic('light');
    resetFilters();
    saveFilters();
    router.dismiss();
  }, [resetFilters, saveFilters]);

  useLayoutEffect(() => {
    applyHeaderActions(navigation, {
      right: [
        {
          type: 'button',
          key: 'reset',
          label: 'Reset Filters',
          iosSymbol: 'arrow.counterclockwise',
          icon: 'restore',
          onPress: handleReset,
        },
        {
          type: 'button',
          key: 'save',
          label: 'Save Filters',
          iosSymbol: 'checkmark',
          icon: 'check',
          variant: 'prominent',
          onPress: handleSave,
        },
      ],
    });
  }, [navigation, handleReset, handleSave]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Item Filters',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
          headerTitleAlign: 'center',
        }}
      />
      <ItemFilters
        filters={filters}
        toggleFilter={toggleFilter}
        updatePriceMin={updatePriceMin}
        updatePriceMax={updatePriceMax}
      />
    </>
  );
}

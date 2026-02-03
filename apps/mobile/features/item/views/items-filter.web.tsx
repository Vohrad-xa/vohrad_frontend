import React, {forwardRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
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
>((_props, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      present: async () => {},
      dismiss: async () => {},
    }),
    [],
  );

  return <View />;
});

ItemsFilterSheet.displayName = 'ItemsFilterSheet';

export default ItemsFilterSheet;

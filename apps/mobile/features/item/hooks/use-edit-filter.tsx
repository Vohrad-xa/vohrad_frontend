import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ForwardedRef,
  type RefObject,
} from 'react';
import {triggerHaptic} from '@/utils';
import {DEFAULT_ITEM_FILTERS, useItemFilters} from './use-item-filters';
import type {TrueSheet} from '@lodev09/react-native-true-sheet';
import type {ItemFilterState} from '@sykamore/types';

type StatusValue = NonNullable<ItemFilterState['statuses']>[number];
type TrackingValue = NonNullable<ItemFilterState['trackingModes']>[number];

type ToggleRowModel = Readonly<{
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}>;

type SheetHandle = {
  present: () => Promise<void>;
  dismiss: () => Promise<void>;
};

type UseEditFilterOptions = {
  initialFilters: ItemFilterState;
  sheetHandleRef: ForwardedRef<SheetHandle>;
};

type UseEditFilterResult = {
  sheetRef: RefObject<TrueSheet | null>;
  filters: ItemFilterState;
  statusRows: ToggleRowModel[];
  trackingRows: ToggleRowModel[];
  priceMinLabel: string;
  priceMaxLabel: string;
  updatePriceMin: (value: number | null) => void;
  updatePriceMax: (value: number | null) => void;
  handleSave: () => void;
  handleReset: () => void;
};

const STATUS_FILTERS = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
] as const satisfies ReadonlyArray<{label: string; value: StatusValue}>;

const TRACKING_FILTERS = [
  {label: 'Abstract', value: 'abstract'},
  {label: 'Lot', value: 'lot'},
  {label: 'Serialized', value: 'serialized'},
] as const satisfies ReadonlyArray<{label: string; value: TrackingValue}>;

export function useEditFilter({
  initialFilters,
  sheetHandleRef,
}: UseEditFilterOptions): UseEditFilterResult {
  const sheetRef = useRef<TrueSheet | null>(null);

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
    sheetHandleRef,
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

  const priceMinLabel = filters.priceMin?.toFixed(2) ?? '0.00';
  const priceMaxLabel = filters.priceMax?.toFixed(2) ?? '10000.00';

  return {
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
  };
}

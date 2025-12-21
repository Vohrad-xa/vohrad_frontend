import {useState, useCallback, useEffect, useRef} from 'react';
import {useItemDetailManager, useAuthStore} from '@sykamore/store';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {useSettingsHeader} from '@/hooks';
import {validators} from '@/utils';

import type {ItemLocationData} from '@sykamore/types';

type EditableLocation = Omit<ItemLocationData, 'quantity'> & {
  quantity: string;
};

export function useItemLocation() {
  const router = useRouter();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item, updateLocation, isLoading} = useItemDetailManager(itemId);
  const setError = useAuthStore((state) => state.setError);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [locations, setLocations] = useState<EditableLocation[]>([]);
  const originalLocations = useRef<EditableLocation[]>([]);

  // Sync locations when item changes
  useEffect(() => {
    if (item?.locations && item.locations.length > 0) {
      const newLocations = item.locations.map((loc) => ({
        ...loc,
        quantity: String(loc.quantity ?? ''),
      }));
      setLocations(newLocations);
      if (!isEditMode) {
        originalLocations.current = newLocations;
      }
    }
  }, [item?.locations, isEditMode]);

  const handleClose = useCallback(() => {
    router.dismiss();
  }, [router]);

  const performSaveRef = useRef<(() => Promise<void>) | null>(null);

  const handleEditSave = useCallback(async () => {
    if (isEditMode) {
      await performSaveRef.current?.();
    } else {
      setIsEditMode(true);
    }
  }, [isEditMode]);

  const {triggerSuccess} = useSettingsHeader({
    navigation,
    isEditing: isEditMode,
    hasChanges,
    onSave: handleEditSave,
    onClose: handleClose,
  });

  const performSave = useCallback(async (): Promise<void> => {
    const checkForChanges = () => {
      return (
        JSON.stringify(locations) !== JSON.stringify(originalLocations.current)
      );
    };

    if (!checkForChanges()) {
      return;
    }

    const changedLocations = locations.filter((loc, index) => {
      const original = originalLocations.current[index];
      return original && loc.quantity !== original.quantity;
    });

    if (changedLocations.length === 0) {
      return;
    }

    try {
      for (const loc of changedLocations) {
        const result = validators.validateNumeric(loc.quantity, {
          min: 1,
          max: 10_000_000,
          allowZero: false,
          precision: {mode: 'decimal', maxFractionDigits: 2},
        });

        if (!result.isValid || typeof result.value !== 'number') {
          const message = result.error ?? 'Quantity must be a valid number';
          setError(message);
          throw new Error(message);
        }

        if (!loc.item_location_id) {
          const message = 'Item location identifier is missing.';
          setError(message);
          throw new Error(message);
        }

        await updateLocation(loc.item_location_id, {
          quantity: result.value,
        });
      }

      originalLocations.current = [...locations];
      setHasChanges(false);
      setIsEditMode(false);
      triggerSuccess();
    } catch (err) {
      throw err;
    }
  }, [locations, updateLocation, triggerSuccess, setError]);

  performSaveRef.current = performSave;

  const handleQuantityChange = useCallback(
    (itemLocationId: string, quantity: string) => {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.item_location_id === itemLocationId ? {...loc, quantity} : loc,
        ),
      );
    },
    [],
  );

  const checkForChanges = useCallback(() => {
    return (
      JSON.stringify(locations) !== JSON.stringify(originalLocations.current)
    );
  }, [locations]);

  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [checkForChanges]);

  return {
    locations,
    isEditMode,
    isLoading,
    item,
    handleQuantityChange,
  };
}

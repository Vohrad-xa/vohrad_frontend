import {useState, useCallback, useEffect, useRef} from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useRouter, useNavigation, useLocalSearchParams} from 'expo-router';
import {useSettingsHeader} from '@/hooks';

interface LocationQuantity {
  id: string;
  name: string;
  code: string;
  quantity: string;
}

export function useItemLocation() {
  const router = useRouter();
  const navigation = useNavigation();
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item, updateLocation, isLoading, refresh} =
    useItemDetailManager(itemId);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [locations, setLocations] = useState<LocationQuantity[]>([]);
  const originalLocations = useRef<LocationQuantity[]>([]);

  // Sync locations when item changes
  useEffect(() => {
    if (item?.locations && item.locations.length > 0) {
      const newLocations = item.locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        quantity: String(loc.quantity),
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
        await updateLocation(loc.id, {
          quantity: parseFloat(loc.quantity),
        });
      }

      // Refresh item to update total_quantity
      await refresh();

      originalLocations.current = [...locations];
      setHasChanges(false);
      setIsEditMode(false);
      triggerSuccess();
    } catch (err) {
      throw err;
    }
  }, [locations, updateLocation, triggerSuccess, refresh]);

  performSaveRef.current = performSave;

  const handleQuantityChange = useCallback((id: string, quantity: string) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? {...loc, quantity} : loc)),
    );
  }, []);

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

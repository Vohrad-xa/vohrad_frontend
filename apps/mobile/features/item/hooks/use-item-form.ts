import {useCallback, useState, useEffect, useRef} from 'react';
import {Keyboard} from 'react-native';
import {useUpdateItem} from '@vohrad/store';
import type {TrackingMode, ItemUpdate} from '@vohrad/types';

interface ItemFormValues {
  name: string;
  code: string;
  serialNumber: string;
}

interface UseItemFormProps {
  itemId: string;
  initialValues: {
    name?: string;
    code?: string;
    serialNumber?: string;
    trackingMode?: TrackingMode;
    isActive?: boolean;
  };
  onHasChangesChange?: (hasChanges: boolean) => void;
}

export function useItemForm({
  itemId,
  initialValues,
  onHasChangesChange,
}: UseItemFormProps) {
  const {updateItem} = useUpdateItem();

  // Form state
  const [formValues, setFormValues] = useState<ItemFormValues>(() => ({
    name: initialValues.name ?? '',
    code: initialValues.code ?? '',
    serialNumber: initialValues.serialNumber ?? '',
  }));

  const [optimisticStatus, setOptimisticStatus] = useState(
    initialValues.isActive,
  );
  const [optimisticTrackingMode, setOptimisticTrackingMode] = useState(
    initialValues.trackingMode,
  );

  // Track original values for change detection
  const originalValues = useRef<ItemFormValues>({
    name: initialValues.name ?? '',
    code: initialValues.code ?? '',
    serialNumber: initialValues.serialNumber ?? '',
  });

  // Initialize with initial values
  useEffect(() => {
    const newValues: ItemFormValues = {
      name: initialValues.name ?? '',
      code: initialValues.code ?? '',
      serialNumber: initialValues.serialNumber ?? '',
    };

    // Only update if values actually changed
    if (
      newValues.name !== originalValues.current.name ||
      newValues.code !== originalValues.current.code ||
      newValues.serialNumber !== originalValues.current.serialNumber
    ) {
      originalValues.current = newValues;
      setFormValues(newValues);
    }
  }, [initialValues.name, initialValues.code, initialValues.serialNumber]);

  useEffect(() => {
    setOptimisticStatus(initialValues.isActive);
  }, [initialValues.isActive]);

  useEffect(() => {
    setOptimisticTrackingMode(initialValues.trackingMode);
  }, [initialValues.trackingMode]);

  // Check if form has changes
  const checkForChanges = useCallback((): boolean => {
    return (
      formValues.name !== originalValues.current.name ||
      formValues.code !== originalValues.current.code ||
      formValues.serialNumber !== originalValues.current.serialNumber
    );
  }, [formValues]);

  // Notify parent of changes
  useEffect(() => {
    onHasChangesChange?.(checkForChanges());
  }, [checkForChanges, onHasChangesChange]);

  // Field change handlers
  const handleFieldChange = useCallback(
    (field: keyof ItemFormValues, value: string) => {
      setFormValues((prev) => ({...prev, [field]: value}));
    },
    [],
  );

  const handleStatusChange = useCallback(
    async (value: boolean) => {
      setOptimisticStatus(value);

      try {
        await updateItem(itemId, {
          is_active: value,
        });
      } catch (error) {
        setOptimisticStatus(initialValues.isActive);
        // Error is already handled by the store hook
        // Just re-throw to let the caller handle UI feedback
        throw error;
      }
    },
    [itemId, updateItem, initialValues.isActive],
  );

  const handleTrackingModeChange = useCallback(
    async (value: TrackingMode) => {
      setOptimisticTrackingMode(value);

      try {
        await updateItem(itemId, {
          tracking_mode: value,
        });
      } catch (error) {
        setOptimisticTrackingMode(initialValues.trackingMode);
        // Error is already handled by the store hook
        // Just re-throw to let the caller handle UI feedback
        throw error;
      }
    },
    [itemId, updateItem, initialValues.trackingMode],
  );

  // Save form changes
  const performSave = useCallback(async (): Promise<void> => {
    const updates: Partial<ItemUpdate> = {};

    if (formValues.name !== originalValues.current.name) {
      updates.name = formValues.name;
    }
    if (formValues.code !== originalValues.current.code) {
      updates.code = formValues.code;
    }
    if (formValues.serialNumber !== originalValues.current.serialNumber) {
      updates.serial_number = formValues.serialNumber;
    }

    if (Object.keys(updates).length === 0) {
      onHasChangesChange?.(false);
      return;
    }

    try {
      await updateItem(itemId, updates);
      originalValues.current = {...formValues};
      onHasChangesChange?.(false);
      // Dismiss keyboard after successful save
      Keyboard.dismiss();
    } catch (error) {
      // Error is already handled by the store hook
      // Store hook sets the error in state, so we just re-throw
      throw error;
    }
  }, [formValues, itemId, updateItem, onHasChangesChange]);

  // Reset form to original values
  const resetForm = useCallback((): void => {
    setFormValues({...originalValues.current});
    onHasChangesChange?.(false);
  }, [onHasChangesChange]);

  return {
    // State
    formValues,
    optimisticStatus,
    optimisticTrackingMode,
    hasChanges: checkForChanges(),

    // Actions
    handleFieldChange,
    handleStatusChange,
    handleTrackingModeChange,
    performSave,
    resetForm,
  };
}

export type UseItemFormReturn = ReturnType<typeof useItemForm>;

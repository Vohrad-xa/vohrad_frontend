import {useCallback, useState, useEffect, useRef} from 'react';
import {Keyboard} from 'react-native';
import {useUpdateItem} from '@vohrad/store';
import type {TrackingMode, ItemUpdate} from '@vohrad/types';

interface ItemFormValues {
  name: string;
  sku: string;
  description: string;
}

interface UseItemFormProps {
  itemId: string;
  initialValues: {
    name?: string;
    sku?: string;
    description?: string | null;
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
  const {mutateAsync: updateItem} = useUpdateItem();

  const [formValues, setFormValues] = useState<ItemFormValues>(() => ({
    name: initialValues.name ?? '',
    sku: initialValues.sku ?? '',
    description: initialValues.description ?? '',
  }));

  const [optimisticStatus, setOptimisticStatus] = useState(
    initialValues.isActive,
  );
  const [optimisticTrackingMode, setOptimisticTrackingMode] = useState(
    initialValues.trackingMode,
  );

  // Track original values
  const originalValues = useRef<ItemFormValues>({
    name: initialValues.name ?? '',
    sku: initialValues.sku ?? '',
    description: initialValues.description ?? '',
  });

  // Initialize with initial values
  useEffect(() => {
    const newValues: ItemFormValues = {
      name: initialValues.name ?? '',
      sku: initialValues.sku ?? '',
      description: initialValues.description ?? '',
    };

    // Only update if values actually changed
    if (
      newValues.name !== originalValues.current.name ||
      newValues.sku !== originalValues.current.sku ||
      newValues.description !== originalValues.current.description
    ) {
      originalValues.current = newValues;
      setFormValues(newValues);
    }
  }, [
    initialValues.name,
    initialValues.sku,
    initialValues.description,
  ]);

  useEffect(() => {
    setOptimisticStatus(initialValues.isActive);
  }, [initialValues.isActive]);

  useEffect(() => {
    setOptimisticTrackingMode(initialValues.trackingMode);
  }, [initialValues.trackingMode]);

  const checkForChanges = useCallback((): boolean => {
    return (
      formValues.name !== originalValues.current.name ||
      formValues.sku !== originalValues.current.sku ||
      formValues.description !== originalValues.current.description
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
        await updateItem({
          id: itemId,
          data: {
            is_active: value,
          },
        });
      } catch (error) {
        setOptimisticStatus(initialValues.isActive);
        // Error is already handled by the store hook
        throw error;
      }
    },
    [itemId, updateItem, initialValues.isActive],
  );

  const handleTrackingModeChange = useCallback(
    async (value: TrackingMode) => {
      setOptimisticTrackingMode(value);

      try {
        await updateItem({
          id: itemId,
          data: {
            tracking_mode: value,
          },
        });
      } catch (error) {
        setOptimisticTrackingMode(initialValues.trackingMode);
        // Error is already handled by the store hookck
        throw error;
      }
    },
    [itemId, updateItem, initialValues.trackingMode],
  );

  const performSave = useCallback(async (): Promise<void> => {
    const updates: Partial<ItemUpdate> = {};

    if (formValues.name !== originalValues.current.name) {
      updates.name = formValues.name;
    }
    if (formValues.sku !== originalValues.current.sku) {
      updates.sku = formValues.sku;
    }
    if (formValues.description !== originalValues.current.description) {
      updates.description = formValues.description;
    }

    if (Object.keys(updates).length === 0) {
      onHasChangesChange?.(false);
      return;
    }

    try {
      await updateItem({id: itemId, data: updates});
      originalValues.current = {...formValues};
      onHasChangesChange?.(false);
      Keyboard.dismiss();
    } catch (error) {
      // Error is already handled by the store hook
      throw error;
    }
  }, [formValues, itemId, updateItem, onHasChangesChange]);

  const resetForm = useCallback((): void => {
    setFormValues({...originalValues.current});
    onHasChangesChange?.(false);
  }, [onHasChangesChange]);

  return {
    formValues,
    optimisticStatus,
    optimisticTrackingMode,
    hasChanges: checkForChanges(),
    handleFieldChange,
    handleStatusChange,
    handleTrackingModeChange,
    performSave,
    resetForm,
  };
}

export type UseItemFormReturn = ReturnType<typeof useItemForm>;

import {useCallback} from 'react';

type UseCancelChangesOptions = {
  isEditing: boolean;
  onReset: () => void;
  onAfterCancel?: () => void;
};

type UseCancelChangesResult = {
  shouldShowCancel: boolean;
  handleCancel: () => void;
};

export function useCancelChanges({
  isEditing,
  onReset,
  onAfterCancel,
}: UseCancelChangesOptions): UseCancelChangesResult {
  const shouldShowCancel = isEditing;

  const handleCancel = useCallback(() => {
    onReset();
    onAfterCancel?.();
  }, [onAfterCancel, onReset]);

  return {
    shouldShowCancel,
    handleCancel,
  };
}

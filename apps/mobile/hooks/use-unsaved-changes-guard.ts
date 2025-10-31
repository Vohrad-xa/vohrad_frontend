import {useRef, useCallback} from 'react';
import {
  usePreventRemove,
  type NavigationAction,
} from '@react-navigation/native';
import {useNavigation} from 'expo-router';
import {showConfirmAlert} from '@/utils';
import {triggerHaptic} from '@/utils/haptics';

type ContentHandle = {
  hasChanges: () => boolean;
  [key: string]: unknown;
};

type UseUnsavedChangesGuardOptions<T extends ContentHandle> = {
  hasChanges: boolean;
  contentRef: React.RefObject<T | null>;
  saveMethodName: keyof T;
  onSaveComplete: () => void;
  saveOptions?: Record<string, unknown>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

// Hook to guard against unsaved changes when navigating away
export function useUnsavedChangesGuard<T extends ContentHandle>({
  hasChanges,
  contentRef,
  saveMethodName,
  onSaveComplete: _onSaveComplete,
  saveOptions,
  title = 'Save Changes?',
  message = 'You have unsaved edits. Save before leaving?',
  confirmText = 'Save',
  cancelText = 'Discard',
}: UseUnsavedChangesGuardOptions<T>) {
  const navigation = useNavigation();
  const pendingNavigationActionRef = useRef<NavigationAction | null>(null);

  usePreventRemove(hasChanges, (event) => {
    void triggerHaptic('warning');

    showConfirmAlert({
      title,
      message,
      confirmText,
      cancelText,
      cancelIsDestructive: true,
      onConfirm: () => {
        pendingNavigationActionRef.current = event.data.action;

        // Call the save method
        const saveMethod = contentRef.current?.[saveMethodName];
        if (typeof saveMethod === 'function') {
          (saveMethod as (options?: unknown) => void)(saveOptions);
        }
      },
      onCancel: () => {
        pendingNavigationActionRef.current = null;
        navigation.dispatch(event.data.action);
      },
    });
  });

  return {
    pendingNavigationActionRef,
    handleNavigationAfterSave: useCallback(() => {
      const pendingAction = pendingNavigationActionRef.current;
      if (pendingAction) {
        pendingNavigationActionRef.current = null;
        navigation.dispatch(pendingAction);
      }
    }, [navigation]),
  };
}

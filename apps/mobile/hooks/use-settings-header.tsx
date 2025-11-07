import {useLayoutEffect, useState, useCallback, useRef, useEffect} from 'react';
import {Platform} from 'react-native';
import {useRouter} from 'expo-router';
import {HeaderButton} from '@/components/ui/header-button';
import {triggerHaptic} from '@/utils/haptics';

type Navigation = {
  setOptions: (options: object) => void;
  goBack: () => void;
};

type UseSettingsHeaderOptions = {
  navigation: Navigation;
  isEditing: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  onClose?: () => void;
  idleAction?: 'edit' | 'none' | 'select';
  onSelect?: () => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
};

export function useSettingsHeader({
  navigation,
  isEditing,
  hasChanges,
  onSave,
  onCancel,
  showCancel = false,
  onClose,
  idleAction = 'edit',
  onSelect,
  selectedCount = 0,
  onDeleteSelected,
}: UseSettingsHeaderOptions) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canShowCancel = showCancel && typeof onCancel === 'function';

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    void triggerHaptic('success');
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    let headerLeft;
    if (onClose) {
      headerLeft = () => (
        <HeaderButton
          variant="close"
          onPress={onClose}
          accessibilityLabel="Close"
        />
      );
    } else if (Platform.OS === 'web') {
      headerLeft = () => (
        <HeaderButton
          variant="back"
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
      );
    } else if (isEditing || (canShowCancel && hasChanges)) {
      headerLeft = () => (
        <HeaderButton
          variant="cancel"
          onPress={onCancel ?? (() => router.back())}
          accessibilityLabel="Cancel"
        />
      );
    } else {
      headerLeft = undefined;
    }

    let headerRight;
    if (showSuccess) {
      headerRight = () => (
        <HeaderButton variant="success" accessibilityLabel="Saved" />
      );
    } else if (isEditing && idleAction === 'select') {
      // Selection mode
      if (selectedCount > 0 && onDeleteSelected) {
        headerRight = () => (
          <HeaderButton
            variant="destructive"
            text="Delete"
            onPress={onDeleteSelected}
            accessibilityLabel={`Delete ${selectedCount} items`}
          />
        );
      } else {
        headerRight = undefined;
      }
    } else if (idleAction === 'select' && onSelect && !isEditing) {
      // Normal mode with select option
      headerRight = () => (
        <HeaderButton
          variant="secondary"
          text="Select"
          onPress={onSelect}
          accessibilityLabel="Select items"
        />
      );
    } else if (hasChanges || (isEditing && idleAction !== 'select')) {
      headerRight = () => (
        <HeaderButton
          variant="save"
          text="Save"
          onPress={onSave}
          accessibilityLabel="Save changes"
        />
      );
    } else if (idleAction === 'edit') {
      headerRight = () => (
        <HeaderButton
          variant="edit"
          text="Edit"
          onPress={onSave}
          accessibilityLabel="Edit"
        />
      );
    } else {
      headerRight = undefined;
    }

    navigation.setOptions({
      headerBackTitle:
        canShowCancel && Platform.OS !== 'web' ? undefined : 'Back',
      headerLeft,
      headerRight,
    });
  }, [
    navigation,
    router,
    onSave,
    isEditing,
    hasChanges,
    showSuccess,
    canShowCancel,
    onCancel,
    onClose,
    idleAction,
    onSelect,
    selectedCount,
    onDeleteSelected,
  ]);

  return {triggerSuccess};
}

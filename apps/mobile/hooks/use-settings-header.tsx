import {useLayoutEffect, useState, useCallback, useRef, useEffect} from 'react';
import {Platform} from 'react-native';
import {useRouter} from 'expo-router';
import {IconButton} from 'react-native-paper';
import {HeaderButton} from '@/components/ui/header-button';
import {triggerHaptic} from '@/utils/haptics';

type Navigation = {
  setOptions: (options: object) => void;
  goBack: () => void;
};

type UseSettingsHeaderOptions = {
  navigation: Navigation;
  isEditing: boolean;
  hasChanges?: boolean;
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
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setShowSuccess(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    // LEFT stays as-is (your HeaderButton)
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
    } else {
      headerLeft = undefined;
    }

    // Decide what the "right action" is
    type RightAction =
      | {kind: 'none'}
      | {kind: 'success'}
      | {kind: 'delete'; label: string; onPress: () => void}
      | {kind: 'select'; label: string; onPress: () => void}
      | {kind: 'save'; label: string; onPress: () => void}
      | {kind: 'edit'; label: string; onPress: () => void};

    let right: RightAction = {kind: 'none'};

    if (showSuccess) {
      right = {kind: 'success'};
    } else if (isEditing && idleAction === 'select') {
      if (selectedCount > 0 && onDeleteSelected) {
        right = {
          kind: 'delete',
          label: `Delete`,
          onPress: onDeleteSelected,
        };
      } else {
        right = {kind: 'none'};
      }
    } else if (idleAction === 'select' && onSelect && !isEditing) {
      right = {kind: 'select', label: 'Select', onPress: onSelect};
    } else if (hasChanges || (isEditing && idleAction !== 'select')) {
      right = {kind: 'save', label: 'Save', onPress: onSave};
    } else if (idleAction === 'edit') {
      right = {kind: 'edit', label: 'Edit', onPress: onSave};
    } else {
      right = {kind: 'none'};
    }

    // iOS: use unstable header items
    const unstable_headerRightItems =
      Platform.OS === 'ios'
        ? () => {
            if (right.kind === 'none') return [];
            if (right.kind === 'success') {
              return [
                {
                  type: 'button',
                  label: 'Saved',
                  icon: {type: 'sfSymbol', name: 'checkmark'},
                  variant: 'clear',
                  onPress: () => {},
                },
              ];
            }

            const isDestructive = right.kind === 'delete';

            // Use SF Symbols on iOS
            const iconName =
              right.kind === 'delete'
                ? 'trash'
                : right.kind === 'select'
                  ? 'checkmark.circle'
                  : right.kind === 'save'
                    ? 'checkmark'
                    : 'square.and.pencil';

            return [
              {
                type: 'button',
                label: right.label,
                icon: {type: 'sfSymbol', name: iconName},
                variant: right.kind === 'save' ? 'prominent' : 'clear',
                tintColor: isDestructive
                  ? 'red'
                  : right.kind === 'save'
                    ? undefined
                    : undefined,

                onPress: () => void right.onPress(),
              },
            ];
          }
        : undefined;

    // Android/Web: use react-native-paper (visible, reliable)
    const headerRight =
      Platform.OS === 'ios'
        ? undefined
        : () => {
            if (right.kind === 'none') return null;

            if (right.kind === 'success') {
              return (
                <IconButton
                  icon="check"
                  disabled
                  style={{margin: 0}}
                  accessibilityLabel="Saved"
                />
              );
            }

            const icon =
              right.kind === 'delete'
                ? 'delete'
                : right.kind === 'select'
                  ? 'check'
                  : right.kind === 'save'
                    ? 'content-save'
                    : 'pencil';

            return (
              <IconButton
                icon={icon}
                onPress={() => void right.onPress()}
                style={{margin: 0}}
                accessibilityLabel={right.label}
              />
            );
          };

    navigation.setOptions({
      headerBackTitle:
        canShowCancel && Platform.OS !== 'web' ? undefined : 'Back',
      headerLeft,
      headerRight,
      unstable_headerRightItems,
    });
  }, [
    navigation,
    router,
    onSave,
    isEditing,
    hasChanges,
    showSuccess,
    canShowCancel,
    onClose,
    idleAction,
    onSelect,
    selectedCount,
    onDeleteSelected,
  ]);

  return {triggerSuccess};
}

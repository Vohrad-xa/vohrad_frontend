// hooks/use-settings-header.ts
import {useLayoutEffect, useState, useCallback, useRef, useEffect} from 'react';
import type {ReactNode} from 'react';
import {Platform, Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {
  getHeaderOptions,
  type HeaderAction,
  type NavigationLike,
} from '@/utils/navigation/header-actions';
import {triggerHaptic} from '../haptics';
import {Icon, AppIcons} from '../icons';

/**
 * Options for `useSettingsHeader`.
 *
 * Centralizes a "settings-style" header:
 * - Left: optional close/back affordance.
 * - Right: contextual action (Save / Edit / Select / Delete / Saved).
 * - iOS uses native `unstable_header*Items` (glass, correct spacing), Android/Web uses Paper buttons.
 */
export type UseSettingsHeaderOptions = {
  /** React Navigation native-stack navigation (only `setOptions` is required). */
  navigation: NavigationLike;

  /** Whether the screen is currently in editing mode. */
  isEditing: boolean;

  /** Whether there are pending changes that can be saved. */
  hasChanges?: boolean;

  /** Save handler (also used as the action for "Edit" in this hook). */
  onSave: () => void;

  /** Optional cancel handler (currently only affects header back title behavior). */
  onCancel?: () => void;

  /** Whether "cancel" semantics are enabled for the screen. */
  showCancel?: boolean;

  /** If provided, shows a "close" button on the left. */
  onClose?: () => void;

  /** Controls what the idle (non-editing) right action is. */
  idleAction?: 'edit' | 'none' | 'select';

  /** Handler for entering selection mode (when `idleAction === 'select'`). */
  onSelect?: () => void;

  /** Selected item count (used to decide whether Delete is shown). */
  selectedCount?: number;

  /** Handler to delete selected items (only used when in selection mode). */
  onDeleteSelected?: () => void;

  /** Tint used for destructive actions (e.g. Delete). */
  destructiveTint?: string;

  /** Tint used for the Save action (iOS pill tint / Android icon tint). */
  saveTint?: string;
};

/**
 * Settings header controller.
 *
 * Left:
 * - `onClose` -> renders a close button.
 * - Web only -> renders a back button (`router.back()`).
 * - Otherwise -> leaves the native back behavior untouched.
 *
 * Right:
 * - `triggerSuccess()` shows a "Saved" state for ~2s.
 * - Selection mode -> shows Delete when `selectedCount > 0`.
 * - Idle select mode -> shows Select.
 * - Has changes / editing -> shows Save.
 * - Idle edit mode -> shows Edit.
 */
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
  destructiveTint = 'red',
  saveTint,
}: UseSettingsHeaderOptions) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canShowCancel = showCancel && typeof onCancel === 'function';

  /**
   * Show a temporary "Saved" indicator in the header.
   * Call this after a successful save.
   */
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
    // LEFT
    let headerLeftElement: ReactNode | undefined;

    if (onClose) {
      headerLeftElement = (
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Icon name={AppIcons.ui.close} />
        </Pressable>
      );
    } else if (Platform.OS === 'web') {
      headerLeftElement = (
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Icon name={AppIcons.ui.chevronLeft} />
        </Pressable>
      );
    }

    // RIGHT
    const right: HeaderAction[] = [];

    if (showSuccess) {
      right.push({
        type: 'button',
        key: 'saved',
        label: 'Saved',
        iosSymbol: 'checkmark',
        icon: 'check',
        disabled: true,
      });
    } else if (isEditing && idleAction === 'select') {
      if (selectedCount > 0 && onDeleteSelected) {
        right.push({
          type: 'button',
          key: 'delete',
          label: 'Delete',
          iosSymbol: 'trash',
          icon: 'delete',
          tintColor: destructiveTint,
          onPress: onDeleteSelected,
        });
      }
    } else if (idleAction === 'select' && onSelect && !isEditing) {
      right.push({
        type: 'button',
        key: 'select',
        label: 'Select',
        iosSymbol: 'checkmark.circle',
        icon: 'check',
        onPress: onSelect,
      });
    } else if (hasChanges || (isEditing && idleAction !== 'select')) {
      right.push({
        type: 'button',
        key: 'save',
        label: 'Save',
        iosSymbol: 'checkmark',
        icon: 'content-save',
        variant: 'prominent',
        tintColor: saveTint,
        onPress: onSave,
      });
    } else if (idleAction === 'edit') {
      right.push({
        type: 'button',
        key: 'edit',
        label: 'Edit',
        iosSymbol: 'pencil',
        icon: 'pencil',
        onPress: onSave,
      });
    }

    navigation.setOptions({
      headerBackTitle:
        canShowCancel && Platform.OS !== 'web' ? undefined : 'Back',
      ...getHeaderOptions({
        headerLeftElement,
        right,
      }),
    });
  }, [
    navigation,
    router,
    onClose,
    onSave,
    onSelect,
    isEditing,
    hasChanges,
    idleAction,
    selectedCount,
    onDeleteSelected,
    showSuccess,
    canShowCancel,
    destructiveTint,
    saveTint,
  ]);

  return {triggerSuccess};
}

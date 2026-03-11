import {type RefObject, useCallback, useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {router} from 'expo-router';
import {Palette} from '@/constants';
import {AppIcons} from '@/utils';
import {getHeaderOptions} from '@/utils/navigation/header-actions';

/**
 * Generic handle interface for profile content components.
 * Each content component should expose a `save` method.
 */
export type ProfileContentHandle = {
  save: () => Promise<void>;
};

type UseProfileHeaderOptions = {
  /**
   * Ref to the content component that exposes a `save()` method.
   */
  contentRef: RefObject<ProfileContentHandle | null>;
  /**
   * Whether to apply the Save header action.
   */
  enabled?: boolean;
};

/**
 * Hook to configure the standard profile modal header with a Save button.
 *
 * This consolidates the common header pattern used across all profile modals:
 * - Sets up a "Save" button on the right side of the header
 * - Calls the content's `save()` method when pressed
 * - Dismisses the modal after saving
 */
export function useProfileHeader({
  contentRef,
  enabled = true,
}: UseProfileHeaderOptions) {
  const navigation = useNavigation();

  const handleSave = useCallback(async () => {
    await contentRef.current?.save();
    router.dismiss();
  }, [contentRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      navigation.setOptions({
        headerRight: undefined,
        unstable_headerRightItems: undefined,
      });
      return;
    }

    const options = getHeaderOptions({
      right: [
        {
          type: 'button',
          key: 'save',
          label: 'Save',
          iosSymbol: AppIcons.actions.save,
          icon: AppIcons.actions.save,
          variant: 'done',
          tintColor: Platform.OS === 'ios' ? Palette.orange : undefined,
          onPress: handleSave,
        },
      ],
    });

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [enabled, navigation, handleSave]);
}

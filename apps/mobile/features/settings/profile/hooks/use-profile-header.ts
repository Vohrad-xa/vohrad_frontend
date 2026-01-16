import {type RefObject, useCallback, useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {router} from 'expo-router';
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
};

/**
 * Hook to configure the standard profile modal header with a Save button.
 *
 * This consolidates the common header pattern used across all profile modals:
 * - Sets up a "Save" button on the right side of the header
 * - Calls the content's `save()` method when pressed
 * - Dismisses the modal after saving
 */
export function useProfileHeader({contentRef}: UseProfileHeaderOptions) {
  const navigation = useNavigation();

  const handleSave = useCallback(async () => {
    await contentRef.current?.save();
    router.dismiss();
  }, [contentRef]);

  useLayoutEffect(() => {
    const options = getHeaderOptions({
      right: [
        {
          type: 'button',
          key: 'save',
          label: 'Save',
          iosSymbol: 'checkmark',
          icon: 'content-save',
          variant: 'prominent',
          onPress: handleSave,
        },
      ],
    });

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [navigation, handleSave]);
}

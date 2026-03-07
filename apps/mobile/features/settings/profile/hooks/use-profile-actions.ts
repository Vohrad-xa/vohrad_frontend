import {useCallback} from 'react';
import {useProfileManager} from '@sykamore/store';

/**
 * Business logic for profile actions.
 * Reusable across platform-specific UI implementations
 */
export function useProfileActions({
  onSaveComplete,
  manager,
}: {
  onSaveComplete?: () => void;
  manager?: ReturnType<typeof useProfileManager>;
} = {}) {
  const defaultManager = useProfileManager();
  const {profileDetails, hasChanges, submitUpdate} = manager ?? defaultManager;

  const handleSaveProfile = useCallback(async () => {
    await submitUpdate();
    onSaveComplete?.();
  }, [submitUpdate, onSaveComplete]);

  return {
    profileDetails,
    hasChanges,
    handleSaveProfile,
  };
}

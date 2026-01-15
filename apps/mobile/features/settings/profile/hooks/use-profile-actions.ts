import {useCallback} from 'react';
import {useEmailConfirmation, useProfileManager} from '@sykamore/store';
import {showConfirmAlert, showAlert} from '@/utils';
import type {SaveProfileOptions} from '../types';

/**
 * Business logic for profile actions (save, resend email, etc.)
 * Reusable across platform-specific UI implementations
 */
export function useProfileActions({
  onSaveComplete,
}: {
  onSaveComplete?: () => void;
} = {}) {
  const {profileDetails, hasChanges, submitUpdate} = useProfileManager();
  const {resendPendingEmail, isProcessing: isResendingEmail} =
    useEmailConfirmation();

  const performUpdate = useCallback(async () => {
    if (!hasChanges()) {
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your profile.',
      });
      return;
    }

    await submitUpdate();
    onSaveComplete?.();
  }, [hasChanges, submitUpdate, onSaveComplete]);

  const handleSaveProfile = useCallback(
    (options?: SaveProfileOptions) => {
      if (options?.skipConfirm) {
        void performUpdate();
        return;
      }

      showConfirmAlert({
        title: 'Update Profile',
        message: 'Are you sure you want to save these changes?',
        confirmText: 'Save',
        cancelText: 'Discard',
        cancelIsDestructive: true,
        onConfirm: () => {
          void performUpdate();
        },
      });
    },
    [performUpdate],
  );

  const handleResendPendingEmail = useCallback(async () => {
    const succeeded = await resendPendingEmail();
    if (succeeded) {
      showAlert({
        title: 'Verification Email Sent',
        message: 'Check your inbox to confirm the new address.',
      });
    } else {
      showAlert({
        title: 'Unable to Resend',
        message: 'Please try again in a moment.',
      });
    }
  }, [resendPendingEmail]);

  return {
    profileDetails,
    hasChanges,
    handleSaveProfile,
    handleResendPendingEmail,
    isResendingEmail,
  };
}

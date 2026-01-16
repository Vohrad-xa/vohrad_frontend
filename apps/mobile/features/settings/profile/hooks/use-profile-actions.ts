import {useCallback} from 'react';
import {useEmailConfirmation, useProfileManager} from '@sykamore/store';
import {showAlert} from '@/utils';

/**
 * Business logic for profile actions (save, resend email, etc.)
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
  const {resendPendingEmail, isProcessing: isResendingEmail} =
    useEmailConfirmation();

  const handleSaveProfile = useCallback(async () => {
    await submitUpdate();
    onSaveComplete?.();
  }, [submitUpdate, onSaveComplete]);

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

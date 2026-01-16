import {useCallback} from 'react';
import {useProfileDetails, useUpdateProfile} from '@sykamore/store';
import {formatDateInput} from '@/utils';

/**
 * Shared hook for profile data and updates.
 * Used by the main profile view and all modal views.
 */
export function useProfile() {
  const profileDetails = useProfileDetails();
  const {updateProfile, isLoading} = useUpdateProfile();

  const firstName = profileDetails?.first_name ?? '';
  const lastName = profileDetails?.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'No Name';
  const dateOfBirth = profileDetails?.date_of_birth ?? null;
  const email = profileDetails?.email ?? '';
  const phoneNumber = profileDetails?.phone_number ?? '';
  const address = profileDetails?.address ?? '';
  const city = profileDetails?.city ?? '';
  const province = profileDetails?.province ?? '';
  const postalCode = profileDetails?.postal_code ?? '';
  const country = profileDetails?.country ?? '';
  const pendingEmail = profileDetails?.pending_email ?? null;
  const pendingEmailExpiresAt =
    profileDetails?.pending_email_expires_at ?? null;

  // Update methods for modals
  const updateDateOfBirth = useCallback(
    async (date: Date) => {
      await updateProfile({date_of_birth: formatDateInput(date)});
    },
    [updateProfile],
  );

  const updateName = useCallback(
    async (first: string, last: string) => {
      await updateProfile({first_name: first, last_name: last});
    },
    [updateProfile],
  );

  const updateEmail = useCallback(
    async (newEmail: string) => {
      await updateProfile({email: newEmail});
    },
    [updateProfile],
  );

  const updatePhoneNumber = useCallback(
    async (phone: string) => {
      await updateProfile({phone_number: phone});
    },
    [updateProfile],
  );

  const updateAddress = useCallback(
    async (data: {
      address?: string;
      city?: string;
      province?: string;
      postal_code?: string;
      country?: string;
    }) => {
      await updateProfile(data);
    },
    [updateProfile],
  );

  return {
    // Read-only data
    profileDetails,
    firstName,
    lastName,
    fullName,
    dateOfBirth,
    email,
    pendingEmail,
    pendingEmailExpiresAt,
    phoneNumber,
    address,
    city,
    province,
    postalCode,
    country,
    isLoading,

    // Update methods for modals
    updateDateOfBirth,
    updateName,
    updateEmail,
    updatePhoneNumber,
    updateAddress,
  };
}

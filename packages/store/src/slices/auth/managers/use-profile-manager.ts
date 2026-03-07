import {useState, useCallback, useMemo, useEffect} from 'react';
import {useFetchUserProfile, useUpdateProfile} from '../hooks';
import type {UserUpdateData} from '@sykamore/types';

type ProfileFormState = Required<{
  [K in keyof UserUpdateData]: string;
}>;

export function useProfileManager() {
  const {data: profileDetails} = useFetchUserProfile();
  const {updateProfile, isLoading} = useUpdateProfile();

  const emptyProfileState: ProfileFormState = useMemo(
    () => ({
      first_name: '',
      last_name: '',
      phone_number: '',
      date_of_birth: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: '',
    }),
    [],
  );

  const [profile, setProfile] = useState<ProfileFormState>(emptyProfileState);
  const [initialProfile, setInitialProfile] =
    useState<ProfileFormState>(emptyProfileState);

  useEffect(() => {
    if (profileDetails) {
      const nextProfile: ProfileFormState = {
        first_name: profileDetails.first_name ?? '',
        last_name: profileDetails.last_name ?? '',
        phone_number: profileDetails.phone_number ?? '',
        date_of_birth: profileDetails.date_of_birth ?? '',
        address: profileDetails.address ?? '',
        city: profileDetails.city ?? '',
        province: profileDetails.province ?? '',
        postal_code: profileDetails.postal_code ?? '',
        country: profileDetails.country ?? '',
      };

      setProfile(nextProfile);
      setInitialProfile(nextProfile);
    } else {
      setProfile(emptyProfileState);
      setInitialProfile(emptyProfileState);
    }
  }, [profileDetails, emptyProfileState]);

  const updateField = useCallback(
    (key: keyof ProfileFormState, value: string) => {
      setProfile((prev) => ({...prev, [key]: value}));
    },
    [],
  );

  const isProfileKey = useCallback(
    (key: string): key is keyof ProfileFormState =>
      Object.prototype.hasOwnProperty.call(emptyProfileState, key),
    [emptyProfileState],
  );

  const computeUpdateValue = useCallback(
    (key: keyof ProfileFormState): string | null | undefined => {
      const currentValue = profile[key].trim();
      const originalValue = initialProfile[key].trim();

      if (currentValue === originalValue) {
        return undefined;
      }

      if (currentValue.length === 0) {
        return originalValue.length > 0 ? null : undefined;
      }

      return currentValue;
    },
    [profile, initialProfile],
  );

  const hasChanges = useCallback(() => {
    const updateData: UserUpdateData = {
      first_name: computeUpdateValue('first_name'),
      last_name: computeUpdateValue('last_name'),
      phone_number: computeUpdateValue('phone_number'),
      date_of_birth: computeUpdateValue('date_of_birth'),
      address: computeUpdateValue('address'),
      city: computeUpdateValue('city'),
      province: computeUpdateValue('province'),
      postal_code: computeUpdateValue('postal_code'),
      country: computeUpdateValue('country'),
    };

    return Object.values(updateData).some((value) => value !== undefined);
  }, [computeUpdateValue]);

  const getUpdateData = useCallback((): UserUpdateData => {
    return {
      first_name: computeUpdateValue('first_name'),
      last_name: computeUpdateValue('last_name'),
      phone_number: computeUpdateValue('phone_number'),
      date_of_birth: computeUpdateValue('date_of_birth'),
      address: computeUpdateValue('address'),
      city: computeUpdateValue('city'),
      province: computeUpdateValue('province'),
      postal_code: computeUpdateValue('postal_code'),
      country: computeUpdateValue('country'),
    };
  }, [computeUpdateValue]);

  const submitUpdate = useCallback(async () => {
    const updateData = getUpdateData();
    await updateProfile(updateData);
  }, [getUpdateData, updateProfile]);

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
      if (isProfileKey(key)) {
        updateField(key, value);
      }
    },
    [isProfileKey, updateField],
  );

  return {
    profileDetails,
    isLoading,
    profile,
    updateField: handleFieldChange,
    hasChanges,
    submitUpdate,
  };
}

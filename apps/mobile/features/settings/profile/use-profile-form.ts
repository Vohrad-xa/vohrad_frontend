import {useState, useCallback, useMemo, useEffect} from 'react';
import {useProfileDetails, useUpdateProfile} from '@vohrad/store';
import type {User, UserUpdateData} from '@vohrad/types';

type InfoField = {
  key: string;
  label: string;
  value?: string | null;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

type SectionKey = 'all';

type ProfileFormState = Required<{
  [K in keyof UserUpdateData]: string;
}>;

export function useProfileForm(isEditing: boolean) {
  const profileDetails = useProfileDetails();
  const {updateProfile, isLoading} = useUpdateProfile();

  const emptyProfileState: ProfileFormState = useMemo(
    () => ({
      first_name: '',
      last_name: '',
      email: '',
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
        email: profileDetails.email ?? '',
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

  const allFields = useMemo(() => {
    if (!profileDetails) return [];

    return [
      {
        key: 'first_name',
        label: 'First Name',
        placeholder: 'First Name',
        value: profileDetails.first_name,
      },
      {
        key: 'last_name',
        label: 'Last Name',
        placeholder: 'Last Name',
        value: profileDetails.last_name,
      },
      {
        key: 'email',
        label: 'Email',
        placeholder: 'Email',
        keyboardType: 'email-address' as const,
        value: profileDetails.email,
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        placeholder: 'Phone Number',
        keyboardType: 'phone-pad' as const,
        value: profileDetails.phone_number,
      },
      {
        key: 'date_of_birth',
        label: 'Date of Birth',
        placeholder: 'Select date',
        type: 'date' as const,
        value: profileDetails.date_of_birth,
      },
      {
        key: 'address',
        label: 'Address',
        placeholder: 'Street Address',
        value: profileDetails.address,
      },
      {
        key: 'city',
        label: 'City',
        placeholder: 'City',
        value: profileDetails.city,
      },
      {
        key: 'province',
        label: 'Province',
        placeholder: 'Province/State',
        value: profileDetails.province,
      },
      {
        key: 'postal_code',
        label: 'Zip Code',
        placeholder: 'Zip Code',
        value: profileDetails.postal_code,
      },
      {
        key: 'country',
        label: 'Country',
        placeholder: 'Country',
        value: profileDetails.country,
      },
    ];
  }, [profileDetails]);

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setProfile((prev) => ({...prev, [key]: value}));
  };

  const computeUpdateValue = useCallback(
    (key: keyof ProfileFormState): string | null | undefined => {
      const currentValue = profile[key].trim();
      const originalValue = initialProfile[key].trim();

      if (currentValue === originalValue) {
        return undefined;
      }

      if (key === 'email' && currentValue.length === 0) {
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
      email: (() => {
        const value = computeUpdateValue('email');
        return value ?? undefined;
      })(),
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
      email: (() => {
        const value = computeUpdateValue('email');
        return value ?? undefined;
      })(),
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

  return {
    profileDetails,
    isLoading,
    profile,
    allFields,
    updateField,
    hasChanges,
    submitUpdate,
  };
}

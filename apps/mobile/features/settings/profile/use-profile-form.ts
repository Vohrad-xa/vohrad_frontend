import {useMemo} from 'react';
import {useProfileManager} from '@sykamore/store';
import type {InfoField} from '@/components/ui';

export function useProfileForm() {
  const manager = useProfileManager();

  const personalInfoFields = useMemo((): InfoField[] => {
    if (!manager.profileDetails) return [];

    return [
      {
        key: 'first_name',
        label: 'First Name',
        placeholder: 'First Name',
        value: manager.profileDetails.first_name,
        span: 'half' as const,
      },
      {
        key: 'last_name',
        label: 'Last Name',
        placeholder: 'Last Name',
        value: manager.profileDetails.last_name,
        span: 'half' as const,
      },
      {
        key: 'date_of_birth',
        label: 'Date of Birth',
        placeholder: 'Select date',
        type: 'date' as const,
        value: manager.profileDetails.date_of_birth,
        span: 'full' as const,
      },
    ];
  }, [manager.profileDetails]);

  const contactFields = useMemo((): InfoField[] => {
    if (!manager.profileDetails) return [];

    return [
      {
        key: 'email',
        label: 'Email',
        placeholder: 'Email',
        keyboardType: 'email-address' as const,
        value: manager.profileDetails.email,
        span: 'full' as const,
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        placeholder: 'Phone Number',
        keyboardType: 'phone-pad' as const,
        value: manager.profileDetails.phone_number,
        span: 'full' as const,
      },
    ];
  }, [manager.profileDetails]);

  const addressFields = useMemo((): InfoField[] => {
    if (!manager.profileDetails) return [];

    return [
      {
        key: 'address',
        label: 'Address',
        placeholder: 'Street Address',
        value: manager.profileDetails.address,
        span: 'full' as const,
      },
      {
        key: 'city',
        label: 'City',
        placeholder: 'City',
        value: manager.profileDetails.city,
        span: 'half' as const,
      },
      {
        key: 'postal_code',
        label: 'Zip Code',
        placeholder: 'Zip Code',
        value: manager.profileDetails.postal_code,
        span: 'half' as const,
      },
      {
        key: 'province',
        label: 'Province',
        placeholder: 'Province/State',
        value: manager.profileDetails.province,
        span: 'half' as const,
      },
      {
        key: 'country',
        label: 'Country',
        placeholder: 'Country',
        value: manager.profileDetails.country,
        span: 'half' as const,
      },
    ];
  }, [manager.profileDetails]);

  return {
    ...manager,
    personalInfoFields,
    contactFields,
    addressFields,
  };
}

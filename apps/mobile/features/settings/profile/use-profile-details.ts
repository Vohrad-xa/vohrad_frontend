import {useMemo} from 'react';
import {useAuth} from '@/providers';
import type {ExtendedUser, ProfileDetails} from './types';

const EMPTY_PROFILE: ProfileDetails = {
  firstName: null,
  lastName: null,
  email: null,
  address: null,
  phoneNumber: null,
};

const getAddressSegments = (user: ExtendedUser) => {
  const segments = [
    user.address,
    user.city,
    user.province,
    user.postal_code,
    user.country,
  ];

  return segments
    .map((segment) => (typeof segment === 'string' ? segment.trim() : ''))
    .filter((segment) => segment.length > 0);
};

export function mapUserToProfile(user: ExtendedUser | null): ProfileDetails {
  if (!user) {
    return EMPTY_PROFILE;
  }

  const addressSegments = getAddressSegments(user);

  return {
    firstName: user.first_name?.trim() ?? null,
    lastName: user.last_name?.trim() ?? null,
    email: user.email?.trim() ?? null,
    address: addressSegments.length > 0 ? addressSegments.join(', ') : null,
    phoneNumber: user.phone_number?.trim() ?? null,
  };
}

export function useProfileDetails(): ProfileDetails {
  const {user} = useAuth();

  return useMemo(() => {
    const extendedUser = user as ExtendedUser | null;
    return mapUserToProfile(extendedUser);
  }, [user]);
}

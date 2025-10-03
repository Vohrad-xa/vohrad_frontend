import type {User} from '@vohrad/types';

export type ProfileDetails = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  address: string | null;
  phoneNumber: string | null;
};

export type ExtendedUser = User & {
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

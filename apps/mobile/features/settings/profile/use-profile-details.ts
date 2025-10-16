import type {User} from '@vohrad/types';
import {useAuth} from '@/providers';

export function useProfileDetails(): User | null {
  const {user} = useAuth();
  return user;
}

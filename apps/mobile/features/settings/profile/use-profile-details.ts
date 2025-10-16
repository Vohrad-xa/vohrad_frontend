import {useAuth} from '@/providers';
import type {User} from '@vohrad/types';

export function useProfileDetails(): User | null {
  const {user} = useAuth();
  return user;
}

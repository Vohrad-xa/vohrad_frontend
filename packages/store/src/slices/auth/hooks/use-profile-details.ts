import {useAuthStore} from '../../../store';
import {authSelectors} from '../selectors';
import type {User} from '@sykamore/types';

export function useProfileDetails(): User | null {
  return useAuthStore(authSelectors.user);
}

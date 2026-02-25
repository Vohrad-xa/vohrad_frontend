import {useAuthStore} from '../../../store';
import {authSelectors} from '../selectors';
import type {Identity} from '@sykamore/types';

export function useProfileDetails(): Identity | null {
  return useAuthStore(authSelectors.user);
}

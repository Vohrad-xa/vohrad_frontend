import {useAuthStore} from '../../store';

export function usePendingFilters() {
  return useAuthStore((state) => state.pendingFilters);
}

export function useSetPendingFilters() {
  return useAuthStore((state) => state.setPendingFilters);
}

export function useClearPendingFilters() {
  return useAuthStore((state) => state.clearPendingFilters);
}

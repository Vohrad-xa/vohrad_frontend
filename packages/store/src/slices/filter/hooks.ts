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

export function useVaultFilter() {
  return useAuthStore((state) => state.vaultFilter);
}

export function useSetVaultFilter() {
  return useAuthStore((state) => state.setVaultFilter);
}

export function useClearVaultFilter() {
  return useAuthStore((state) => state.clearVaultFilter);
}

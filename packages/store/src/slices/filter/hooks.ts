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

export function useAttachmentFilter() {
  return useAuthStore((state) => state.attachmentFilter);
}

export function useSetAttachmentFilter() {
  return useAuthStore((state) => state.setAttachmentFilter);
}

export function useClearAttachmentFilter() {
  return useAuthStore((state) => state.clearAttachmentFilter);
}

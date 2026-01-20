import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {
  useAttachmentFilter,
  useFilteredAttachmentsManager,
  type AttachmentTargetType,
  type AttachmentDisplayItem,
} from '@sykamore/store';

interface AttachmentContextValue {
  attachments: AttachmentDisplayItem[];
  isLoading: boolean;
  error: Error | null;
  targetId?: string | null;
  targetType?: AttachmentTargetType | null;
  hasNext?: boolean;
  loadMore?: () => void;
  refresh?: () => Promise<void> | void;
  lastUpdated?: Date | null;
}

const AttachmentContext = createContext<AttachmentContextValue | undefined>(
  undefined,
);

interface AttachmentProviderProps {
  children: React.ReactNode;
}

export function AttachmentProvider({children}: AttachmentProviderProps) {
  const attachmentFilter = useAttachmentFilter();
  const targetId = attachmentFilter?.targetId ?? null;
  const targetType = attachmentFilter?.targetType ?? null;
  const hasActiveTarget = Boolean(targetId && targetType);
  const initialFilter = useMemo(() => {
    if (!targetId || !targetType) {
      return undefined;
    }
    return {targetType, targetId};
  }, [targetId, targetType]);

  const {
    attachments,
    isLoading,
    error,
    hasNext,
    loadMore,
    refresh,
    lastUpdated,
  } = useFilteredAttachmentsManager({
    initialFilter,
    enabled: hasActiveTarget,
  });

  const refreshAttachments = useCallback(async () => {
    if (!refresh) return;
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      attachments,
      isLoading,
      error: error ?? null,
      targetId,
      targetType,
      hasNext: hasActiveTarget ? hasNext : undefined,
      loadMore: hasActiveTarget ? loadMore : undefined,
      refresh: hasActiveTarget ? refreshAttachments : undefined,
      lastUpdated: hasActiveTarget ? lastUpdated : null,
    }),
    [
      attachments,
      isLoading,
      error,
      targetId,
      targetType,
      hasActiveTarget,
      hasNext,
      loadMore,
      refreshAttachments,
      lastUpdated,
    ],
  );

  return (
    <AttachmentContext.Provider value={value}>
      {children}
    </AttachmentContext.Provider>
  );
}

export function useAttachmentContext() {
  const context = useContext(AttachmentContext);
  if (context === undefined) {
    throw new Error(
      'useAttachmentContext must be used within an AttachmentProvider',
    );
  }
  return context;
}

export function useOptionalAttachmentContext() {
  return useContext(AttachmentContext);
}

import React, {createContext, useContext, useMemo} from 'react';
import {
  useFetchTargetAttachments,
  useAttachmentFilter,
  type AttachmentTargetType,
} from '@vohrad/store';
import type {ItemAttachment} from '@vohrad/types';

interface AttachmentContextValue {
  attachments: ItemAttachment[];
  isLoading: boolean;
  error: Error | null;
  targetId?: string | null;
  targetType?: AttachmentTargetType | null;
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
  const {
    data: attachments,
    isLoading,
    error,
  } = useFetchTargetAttachments(
    targetType!,
    targetId,
    !!targetId && !!targetType,
  );

  const value = useMemo(
    () => ({
      attachments: attachments ?? [],
      isLoading,
      error: error ?? null,
      targetId,
      targetType,
    }),
    [attachments, isLoading, error, targetId, targetType],
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

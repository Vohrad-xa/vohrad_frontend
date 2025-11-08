import type {StateCreator} from 'zustand';
import type {ItemAttachment, AttachmentTargetType} from '@vohrad/types';
import type {AsyncState, PaginatedState} from '../../utils/state';

export type AttachmentTargetKey = `${AttachmentTargetType}:${string}`;

export type AttachmentImageUrlEntry = {
  attachmentId: string;
  url: string;
};

type UpdateAttachmentsPagePayload = PaginatedState & {
  attachments: ItemAttachment[];
  strategy?: 'replace' | 'append';
};

export interface AttachmentSlice extends AsyncState, PaginatedState {
  attachments: ItemAttachment[];
  imageUrls: Record<string, AttachmentImageUrlEntry>;
  attachmentsByTarget: Record<AttachmentTargetKey, ItemAttachment[]>;
  attachmentsLoadingByTarget: Record<AttachmentTargetKey, boolean>;
  attachmentsErrorByTarget: Record<AttachmentTargetKey, string | null>;
  setImageUrls: (
    urls:
      | Record<string, AttachmentImageUrlEntry>
      | ((
          prev: Record<string, AttachmentImageUrlEntry>,
        ) => Record<string, AttachmentImageUrlEntry>),
  ) => void;
  updateAttachmentsPage: (payload: UpdateAttachmentsPagePayload) => void;
  clearAttachmentList: () => void;
  setAttachmentLoading: (loading: boolean) => void;
  setAttachmentError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, retryCallback?: () => void) => void;
  clearError: () => void;
  setAttachmentsForTarget: (
    targetKey: AttachmentTargetKey,
    attachments: ItemAttachment[],
  ) => void;
  upsertAttachmentForTarget: (
    targetKey: AttachmentTargetKey,
    attachment: ItemAttachment,
  ) => void;
  removeAttachmentForTarget: (
    targetKey: AttachmentTargetKey,
    attachmentId: string,
  ) => void;
  setTargetLoading: (targetKey: AttachmentTargetKey, loading: boolean) => void;
  setTargetError: (
    targetKey: AttachmentTargetKey,
    error: string | null,
  ) => void;
  clearAttachmentsForTarget: (targetKey: AttachmentTargetKey) => void;
}

export const createAttachmentSlice: StateCreator<AttachmentSlice> = (set) => ({
  attachments: [],
  imageUrls: {},
  isLoading: false,
  error: null,
  retryCallback: null,
  total: 0,
  page: 1,
  size: 20,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
  links: null,
  attachmentsByTarget: {},
  attachmentsLoadingByTarget: {},
  attachmentsErrorByTarget: {},
  setImageUrls: (urls) =>
    set((state) => ({
      imageUrls: typeof urls === 'function' ? urls(state.imageUrls) : urls,
    })),
  updateAttachmentsPage: ({
    attachments,
    strategy = 'replace',
    ...pagination
  }: UpdateAttachmentsPagePayload) =>
    set((state) => ({
      attachments:
        strategy === 'append' && state.attachments.length > 0
          ? [...state.attachments, ...attachments]
          : attachments,
      ...pagination,
    })),
  clearAttachmentList: () =>
    set({
      attachments: [],
      total: 0,
      page: 1,
      size: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      links: null,
      error: null,
      retryCallback: null,
    }),
  setAttachmentLoading: (loading: boolean) => set({isLoading: loading}),
  setAttachmentError: (error: string | null) =>
    set({error, retryCallback: null}),
  setLoading: (loading: boolean) => set({isLoading: loading}),
  setError: (error: string | null, retryCallback?: () => void) =>
    set({error, retryCallback: retryCallback ?? null}),
  clearError: () => set({error: null, retryCallback: null}),
  setAttachmentsForTarget: (targetKey, attachments) =>
    set((state) => ({
      attachmentsByTarget: {
        ...state.attachmentsByTarget,
        [targetKey]: attachments,
      },
    })),
  upsertAttachmentForTarget: (targetKey, attachment) =>
    set((state) => {
      const existingList = state.attachmentsByTarget[targetKey] ?? [];
      const index = existingList.findIndex((item) => item.id === attachment.id);
      const nextList =
        index >= 0
          ? [
              ...existingList.slice(0, index),
              attachment,
              ...existingList.slice(index + 1),
            ]
          : [attachment, ...existingList];

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: nextList,
        },
      };
    }),
  removeAttachmentForTarget: (targetKey, attachmentId) =>
    set((state) => {
      const existingList = state.attachmentsByTarget[targetKey];
      if (!existingList) {
        return {};
      }

      return {
        attachmentsByTarget: {
          ...state.attachmentsByTarget,
          [targetKey]: existingList.filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        },
      };
    }),
  setTargetLoading: (targetKey, loading) =>
    set((state) => ({
      attachmentsLoadingByTarget: {
        ...state.attachmentsLoadingByTarget,
        [targetKey]: loading,
      },
    })),
  setTargetError: (targetKey, error) =>
    set((state) => ({
      attachmentsErrorByTarget: {
        ...state.attachmentsErrorByTarget,
        [targetKey]: error,
      },
    })),
  clearAttachmentsForTarget: (targetKey) =>
    set((state) => {
      const {[targetKey]: _omittedAttachments, ...restAttachments} =
        state.attachmentsByTarget;
      const {[targetKey]: _omittedLoading, ...restLoading} =
        state.attachmentsLoadingByTarget;
      const {[targetKey]: _omittedErrors, ...restErrors} =
        state.attachmentsErrorByTarget;

      return {
        attachmentsByTarget: restAttachments,
        attachmentsLoadingByTarget: restLoading,
        attachmentsErrorByTarget: restErrors,
      };
    }),
});

export function createAttachmentTargetKey(
  targetType: AttachmentTargetType,
  targetId: string,
): AttachmentTargetKey {
  return `${targetType}:${targetId}`;
}

import type {StateCreator} from 'zustand';

export interface AttachmentSlice {
  imageUrls: Record<string, string>;
  isAttachmentLoading: boolean;
  attachmentError: string | null;
  setImageUrls: (
    urls:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  setAttachmentLoading: (loading: boolean) => void;
  setAttachmentError: (error: string | null) => void;
}

export const createAttachmentSlice: StateCreator<AttachmentSlice> = (set) => ({
  imageUrls: {},
  isAttachmentLoading: false,
  attachmentError: null,
  setImageUrls: (urls) =>
    set((state) => ({
      imageUrls: typeof urls === 'function' ? urls(state.imageUrls) : urls,
    })),
  setAttachmentLoading: (loading: boolean) =>
    set({isAttachmentLoading: loading}),
  setAttachmentError: (error: string | null) => set({attachmentError: error}),
});

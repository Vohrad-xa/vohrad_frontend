import {useAuthStore, type StoreState} from '../../../store';
import {attachmentSelectors} from '../selectors';

export const useAttachmentLoading = () =>
  useAuthStore((state: StoreState) =>
    attachmentSelectors.isAttachmentLoading(state),
  );

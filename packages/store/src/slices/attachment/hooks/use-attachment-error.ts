import {useAuthStore, type StoreState} from '../../../store';
import {attachmentSelectors} from '../selectors';

export const useAttachmentError = () =>
  useAuthStore((state: StoreState) =>
    attachmentSelectors.attachmentError(state),
  );

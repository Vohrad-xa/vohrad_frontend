import {useAuthStore, type StoreState} from '../../../store';
import {attachmentSelectors} from '../selectors';

export const useAttachmentUrls = () =>
  useAuthStore((state: StoreState) => attachmentSelectors.imageUrls(state));

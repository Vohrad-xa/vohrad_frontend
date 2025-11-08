import {useCallback} from 'react';
import {useAuthStore, type StoreState} from '../../../store';
import {attachmentSelectors} from '../selectors';
import {useAttachmentTargetKey} from './utils';
import type {AttachmentTargetType} from '@vohrad/types';

export function useAttachmentFetchState(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const targetKey = useAttachmentTargetKey({targetType, targetId});
  const isLoading = useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey
          ? attachmentSelectors.isTargetLoading(state)(targetKey)
          : false,
      [targetKey],
    ),
  );
  const error = useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey ? attachmentSelectors.targetError(state)(targetKey) : null,
      [targetKey],
    ),
  );

  return {isLoading, error};
}

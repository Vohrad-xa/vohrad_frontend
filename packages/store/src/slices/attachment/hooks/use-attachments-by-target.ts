import {useCallback} from 'react';
import {useAuthStore, type StoreState} from '../../../store';
import {attachmentSelectors} from '../selectors';
import {useAttachmentTargetKey} from './utils';
import type {AttachmentTargetType} from '@vohrad/types';

export function useAttachmentsByTarget(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const targetKey = useAttachmentTargetKey({targetType, targetId});
  return useAuthStore(
    useCallback(
      (state: StoreState) =>
        targetKey
          ? attachmentSelectors.attachmentsForTarget(state)(targetKey)
          : [],
      [targetKey],
    ),
  );
}

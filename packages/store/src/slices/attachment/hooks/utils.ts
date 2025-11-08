import {useMemo} from 'react';
import type {AttachmentTargetType} from '@vohrad/types';
import {createAttachmentTargetKey, type AttachmentTargetKey} from '../slice';

export type AttachmentTargetRef = {
  targetType: AttachmentTargetType;
  targetId?: string | null;
};

export function useAttachmentTargetKey(
  ref: AttachmentTargetRef,
): AttachmentTargetKey | null {
  return useMemo(() => {
    if (!ref.targetId) return null;
    return createAttachmentTargetKey(ref.targetType, ref.targetId);
  }, [ref.targetType, ref.targetId]);
}

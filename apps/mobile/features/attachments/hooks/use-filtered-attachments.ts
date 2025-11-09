import {useEffect, useMemo, useRef} from 'react';
import {useAttachmentsListManager, useAttachmentFilter} from '@vohrad/store';
import type {AttachmentKind, AttachmentTargetType} from '@vohrad/types';

interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
}

export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const {kind} = options ?? {};

  const initialFilters = useMemo(() => {
    const filters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind?: AttachmentKind;
    } = {};

    if (attachmentFilter) {
      filters.targetType = attachmentFilter.targetType;
      filters.targetId = attachmentFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    return Object.keys(filters).length > 0 ? filters : kind ? {kind} : {};
  }, []);

  const manager = useAttachmentsListManager({initialFilters});
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind?: AttachmentKind;
    } = {};

    if (attachmentFilter) {
      filters.targetType = attachmentFilter.targetType;
      filters.targetId = attachmentFilter.targetId;
    }

    if (kind) {
      filters.kind = kind;
    }

    manager.setFilters(Object.keys(filters).length > 0 ? filters : {});
  }, [attachmentFilter, kind, manager.setFilters]);

  return manager;
}

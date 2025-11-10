import {useCallback, useEffect, useRef} from 'react';
import {useAttachmentsListManager, useAttachmentFilter} from '@vohrad/store';
import type {AttachmentKind, AttachmentTargetType} from '@vohrad/types';

type AttachmentFilterShape = {
  targetType?: AttachmentTargetType;
  targetId?: string;
  kind?: AttachmentKind;
};

export interface UseFilteredAttachmentsOptions {
  kind?: AttachmentKind;
  pageSize?: number;
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
}

export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const {kind, pageSize, initialFilter} = options ?? {};

  const buildFilterShape = useCallback(
    (
      source?: {
        targetType?: AttachmentTargetType;
        targetId?: string;
      } | null,
    ): AttachmentFilterShape => {
      const shape: AttachmentFilterShape = {};

      if (source?.targetType) {
        shape.targetType = source.targetType;
      }

      if (source?.targetId) {
        shape.targetId = source.targetId;
      }

      if (kind) {
        shape.kind = kind;
      }

      return shape;
    },
    [kind],
  );

  const initialFiltersRef = useRef<AttachmentFilterShape>(
    buildFilterShape(attachmentFilter ?? initialFilter),
  );

  const manager = useAttachmentsListManager({
    initialFilters: initialFiltersRef.current,
    pageSize,
  });

  const {setFilters} = manager;

  const lastAppliedFiltersRef = useRef<string>(
    JSON.stringify(initialFiltersRef.current),
  );
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters = buildFilterShape(attachmentFilter);
    const key = JSON.stringify(filters);

    if (key === lastAppliedFiltersRef.current) {
      return;
    }

    setFilters(filters);
    lastAppliedFiltersRef.current = key;
  }, [attachmentFilter, buildFilterShape, setFilters]);

  return manager;
}

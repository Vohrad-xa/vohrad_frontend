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
  initialFilter?: {
    targetType?: AttachmentTargetType;
    targetId?: string;
  };
}

export function useFilteredAttachments(
  options?: UseFilteredAttachmentsOptions,
) {
  const attachmentFilter = useAttachmentFilter();
  const {kind, initialFilter} = options ?? {};

  const buildFilterShape = useCallback(
    (
      source?: {
        targetType?: AttachmentTargetType;
        targetId?: string;
      } | null,
    ): AttachmentFilterShape | undefined => {
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

      return Object.keys(shape).length > 0 ? shape : undefined;
    },
    [kind],
  );

  const initialFiltersRef = useRef<AttachmentFilterShape | undefined>(
    undefined,
  );

  if (!initialFiltersRef.current) {
    const source = attachmentFilter ?? initialFilter;
    initialFiltersRef.current = buildFilterShape(source);
  }

  const manager = useAttachmentsListManager({
    initialFilters: initialFiltersRef.current,
  });
  const lastAppliedFiltersRef = useRef<string>(
    JSON.stringify(initialFiltersRef.current ?? {}),
  );
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters = buildFilterShape(attachmentFilter);
    const key = JSON.stringify(filters ?? {});

    if (key === lastAppliedFiltersRef.current) {
      return;
    }

    manager.setFilters(filters ?? {});
    lastAppliedFiltersRef.current = key;
  }, [attachmentFilter, buildFilterShape, manager.setFilters]);

  return manager;
}

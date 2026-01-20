import {useMemo} from 'react';
import type {
  AttachmentKind,
  ItemAttachment,
  OrderByDirection,
} from '@sykamore/types';
import {getAttachmentExtension, parseAttachmentOrderBy} from '../utils';

export type UseAttachmentsViewManagerOptions<
  T extends ItemAttachment = ItemAttachment,
> = {
  attachments?: T[] | null;
  kind?: AttachmentKind;
  extension?: string;
  odataOrderBy?: string;
  enabled?: boolean;
};

const resolveAttachmentName = (attachment: ItemAttachment): string =>
  (attachment.original_filename || attachment.filename || '').toLowerCase();

const sortByName = <T extends ItemAttachment>(
  attachments: T[],
  direction: OrderByDirection,
): T[] => {
  return [...attachments].sort((first, second) => {
    const firstName = resolveAttachmentName(first);
    const secondName = resolveAttachmentName(second);
    const comparison = firstName.localeCompare(secondName);
    return direction === 'asc' ? comparison : -comparison;
  });
};

const sortByDate = <T extends ItemAttachment>(
  attachments: T[],
  direction: OrderByDirection,
): T[] => {
  return [...attachments].sort((first, second) => {
    const firstDate = first.created_at ? Date.parse(first.created_at) : 0;
    const secondDate = second.created_at ? Date.parse(second.created_at) : 0;
    return direction === 'asc'
      ? firstDate - secondDate
      : secondDate - firstDate;
  });
};

/**
 * Prepares an in-memory attachments list for UI use.
 *
 * - Applies kind/extension filters and optional orderBy sorting when enabled.
 */
export function useAttachmentsViewManager<
  T extends ItemAttachment = ItemAttachment,
>(options?: UseAttachmentsViewManagerOptions<T>) {
  const {
    attachments,
    kind,
    extension,
    odataOrderBy,
    enabled = true,
  } = options ?? {};
  const normalizedExtension = useMemo(
    () => getAttachmentExtension(extension ? {extension} : null),
    [extension],
  );

  const viewAttachments = useMemo<T[]>(() => {
    if (!attachments || attachments.length === 0) {
      return [];
    }

    if (!enabled) {
      return attachments;
    }

    let scoped = attachments;
    if (kind) {
      scoped = scoped.filter((attachment) => attachment.kind === kind);
    }

    if (normalizedExtension) {
      scoped = scoped.filter((attachment) => {
        const attachmentExtension = attachment.extension?.trim().toLowerCase();
        return attachmentExtension === normalizedExtension;
      });
    }

    const sortState = parseAttachmentOrderBy(odataOrderBy);
    if (sortState.key === 'name') {
      return sortByName(scoped, sortState.direction);
    }

    return sortByDate(scoped, sortState.direction);
  }, [attachments, enabled, kind, normalizedExtension, odataOrderBy]);

  return {
    attachments: viewAttachments,
  };
}

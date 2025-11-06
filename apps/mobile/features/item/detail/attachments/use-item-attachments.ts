import {useMemo} from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import type {AttachmentKindCount} from '@/features/attachments/screens/attachments-overview';
import type {AttachmentKind, ItemAttachment} from '@vohrad/types';

const ZERO_COUNTS: AttachmentKindCount = {
  image: 0,
  document: 0,
  video: 0,
  archive: 0,
  other: 0,
} as const;

const ATTACHMENT_KIND_KEYS: readonly AttachmentKind[] = [
  'image',
  'document',
  'video',
  'archive',
  'other',
];

function resolveAttachmentKind(attachment: ItemAttachment): AttachmentKind {
  const normalizedKind = attachment.kind?.toLowerCase() ?? '';
  if (ATTACHMENT_KIND_KEYS.includes(normalizedKind as AttachmentKind)) {
    return normalizedKind as AttachmentKind;
  }

  return 'other';
}

export function computeAttachmentCounts(
  attachments?: ItemAttachment[] | null,
): AttachmentKindCount {
  if (!attachments || attachments.length === 0) {
    return {...ZERO_COUNTS};
  }

  return attachments.reduce<AttachmentKindCount>(
    (acc, attachment) => {
      if (attachment.deleted_at) {
        return acc;
      }

      const kind = resolveAttachmentKind(attachment);
      acc[kind] += 1;
      return acc;
    },
    {...ZERO_COUNTS},
  );
}

export function filterAttachmentsByKind(
  attachments: ItemAttachment[] | null | undefined,
  kind: AttachmentKind,
): ItemAttachment[] {
  if (!attachments) {
    return [];
  }

  return attachments.filter(
    (attachment) =>
      !attachment.deleted_at && resolveAttachmentKind(attachment) === kind,
  );
}

export function useItemAttachments() {
  const {id: itemId} = useLocalSearchParams<{id?: string}>();
  const {item, isLoading} = useItemDetailManager(itemId);

  const attachments = useMemo(
    () => item?.attachments ?? [],
    [item?.attachments],
  );

  const counts = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  const total = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  return {
    counts,
    total,
    attachments,
    item,
    isLoading,
  };
}

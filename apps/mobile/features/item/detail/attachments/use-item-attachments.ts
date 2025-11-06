import {useMemo} from 'react';
import {useItemDetailManager} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import type {AttachmentKindCount} from '@/features/attachments/screens/attachments-overview';
import type {ItemAttachment} from '@vohrad/types';

const ATTACHMENT_KIND_KEYS = [
  'image',
  'document',
  'video',
  'archive',
  'other',
] as const;

export type AttachmentKindKey = (typeof ATTACHMENT_KIND_KEYS)[number];

const ZERO_COUNTS: AttachmentKindCount = {
  image: 0,
  document: 0,
  video: 0,
  archive: 0,
  other: 0,
};

function isAttachmentKindKey(value: string): value is AttachmentKindKey {
  return (ATTACHMENT_KIND_KEYS as readonly string[]).includes(value);
}

function resolveAttachmentKind(attachment: ItemAttachment): AttachmentKindKey {
  const normalizedKind = attachment.kind?.toLowerCase() ?? '';
  if (isAttachmentKindKey(normalizedKind)) {
    return normalizedKind;
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
  kind: AttachmentKindKey,
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

  const counts = useMemo(
    () => computeAttachmentCounts(item?.attachments),
    [item?.attachments],
  );

  const total = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  return {
    counts,
    total,
    attachments: item?.attachments ?? null,
    item,
    isLoading,
  };
}

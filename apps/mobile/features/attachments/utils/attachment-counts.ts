import type {AttachmentKind, ItemAttachment} from '@sykamore/types';

export type AttachmentKindCount = Record<AttachmentKind, number>;

const ATTACHMENT_KIND_KEYS: readonly AttachmentKind[] = [
  'image',
  'document',
  'archive',
  'other',
];

export const ZERO_ATTACHMENT_COUNTS: AttachmentKindCount = {
  image: 0,
  document: 0,
  archive: 0,
  other: 0,
};

export function resolveAttachmentKind(
  attachment: ItemAttachment,
): AttachmentKind {
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
    return {...ZERO_ATTACHMENT_COUNTS};
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
    {...ZERO_ATTACHMENT_COUNTS},
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

export type AttachmentTargetType = 'item' | 'location' | 'item_location';

export type AttachmentKind =
  | 'image'
  | 'document'
  | 'video'
  | 'archive'
  | 'other';

export interface AttachmentFilter {
  targetType: AttachmentTargetType;
  targetId: string;
  itemName?: string;
}

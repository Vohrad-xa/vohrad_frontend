export type AttachmentTargetType = 'item' | 'location' | 'item_location';

export type AttachmentKind = 'image' | 'document' | 'archive' | 'other';

export interface AttachmentFilter {
  targetType?: AttachmentTargetType;
  targetId?: string;
  itemName?: string;
  extension?: string;
  odataOrderBy?: string;
}

export type OrderByDirection = 'asc' | 'desc';

export type OrderByClause = {
  field: string;
  direction?: OrderByDirection;
};

export type AttachmentSortKey = 'date' | 'name' | 'size';

export type AttachmentSortState = {
  key: AttachmentSortKey;
  direction: OrderByDirection;
};

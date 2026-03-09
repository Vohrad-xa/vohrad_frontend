import {z} from 'zod';
import {itemAttachmentSchema} from './item';
import {attachmentCountsSchema} from './dashboard';

export const attachmentTargetTypeSchema = z.enum([
  'item',
  'location',
  'item_location',
]);

export const attachmentKindSchema = z.enum([
  'image',
  'document',
  'archive',
  'other',
]);

export const attachmentFilterSchema = z.strictObject({
  targetType: attachmentTargetTypeSchema.optional(),
  targetId: z.string().optional(),
  itemName: z.string().optional(),
  extension: z.string().optional(),
  odataOrderBy: z.string().optional(),
});

export const orderByDirectionSchema = z.enum(['asc', 'desc']);

export const orderByClauseSchema = z.strictObject({
  field: z.string(),
  direction: orderByDirectionSchema.optional(),
});

export const attachmentSortKeySchema = z.enum(['date', 'name', 'size']);

export const attachmentSortStateSchema = z.strictObject({
  key: attachmentSortKeySchema,
  direction: orderByDirectionSchema,
});

export const attachmentCountsSummarySchema = z.strictObject({
  attachments_total: z.number().int().nonnegative(),
  attachment_counts: attachmentCountsSchema,
});

export const attachmentWithCountsSchema = z.strictObject({
  attachment: itemAttachmentSchema,
  counts: attachmentCountsSummarySchema,
});

export type AttachmentTargetType = z.infer<typeof attachmentTargetTypeSchema>;
export type AttachmentKind = z.infer<typeof attachmentKindSchema>;
export type AttachmentFilter = z.infer<typeof attachmentFilterSchema>;
export type OrderByDirection = z.infer<typeof orderByDirectionSchema>;
export type OrderByClause = z.infer<typeof orderByClauseSchema>;
export type AttachmentSortKey = z.infer<typeof attachmentSortKeySchema>;
export type AttachmentSortState = z.infer<typeof attachmentSortStateSchema>;
export type AttachmentCounts = z.infer<typeof attachmentCountsSummarySchema>;
export type AttachmentWithCounts = z.infer<typeof attachmentWithCountsSchema>;

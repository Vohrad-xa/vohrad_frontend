import {z} from 'zod';
import {jsonObjectSchema} from '../common';
import {trackingModeSchema} from './item-filters';

export const itemSpecificationsSchema = jsonObjectSchema.nullable();

export const itemLocationDataSchema = z.strictObject({
  id: z.string(),
  item_location_id: z.string(),
  name: z.string(),
  code: z.string(),
  item_lot_id: z.string().nullable().optional(),
  quantity: z.number(),
});

export const itemLocationInputSchema = z.strictObject({
  location_id: z.string(),
  quantity: z.number(),
  item_lot_id: z.string().nullable().optional(),
});

export const itemLocationUpdateSchema = z.strictObject({
  quantity: z.number().optional(),
  moved_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const itemAttachmentSchema = z.strictObject({
  id: z.string(),
  filename: z.string(),
  original_filename: z.string(),
  file_type: z.string(),
  extension: z.string().nullable().optional(),
  size: z.number(),
  file_path: z.string(),
  download_url: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
  target_type: z.string().optional(),
  target_id: z.string().optional(),
});

export const categorySchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  path: z.string().nullable().optional(),
});

export const statusSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});

export const unitOfMeasureSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  symbol: z.string().nullable().optional(),
});

export const supplierSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
});

export const itemLotDataSchema = z.strictObject({
  id: z.string(),
  lot_type: z.string(),
  lot_number: z.string(),
});

const itemRelationIdentifiersSchema = z.strictObject({
  user_id: z.string().nullable().optional(),
  parent_item_id: z.string().nullable().optional(),
  item_relation_id: z.string().nullable().optional(),
});

const itemDescriptiveFieldsSchema = itemRelationIdentifiersSchema.extend({
  name: z.string(),
  sku: z.string(),
  barcode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  specifications: itemSpecificationsSchema.optional(),
  tracking_change_reason: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  status_id: z.string().nullable().optional(),
  unit_id: z.string().nullable().optional(),
  supplier_id: z.string().nullable().optional(),
  category: categorySchema.nullable().optional(),
  status: statusSchema.nullable().optional(),
  unit: unitOfMeasureSchema.nullable().optional(),
  supplier: supplierSchema.nullable().optional(),
});

export const itemMutableFieldsSchema = itemDescriptiveFieldsSchema.extend({
  tracking_mode: trackingModeSchema.optional(),
  is_active: z.boolean().optional(),
});

export const itemSchema = itemDescriptiveFieldsSchema.extend({
  id: z.string(),
  tracking_mode: trackingModeSchema,
  is_active: z.boolean(),
  tracking_changed_at: z.string().nullable().optional(),
  total_quantity: z.number(),
  thumbnail: itemAttachmentSchema.nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const itemDetailSchema = itemSchema.extend({
  locations: z.array(itemLocationDataSchema).nullable().optional(),
  lots: z.array(itemLotDataSchema).nullable().optional(),
  attachments: z.array(itemAttachmentSchema).nullable().optional(),
});

export const itemCreateSchema = itemMutableFieldsSchema.extend({
  locations: z.array(itemLocationInputSchema).optional(),
});

export const itemUpdateSchema = itemMutableFieldsSchema.partial();

export const itemSpecificationsEditorItemSchema = itemSchema.pick({
  id: true,
  specifications: true,
});

export type ItemSpecifications = z.infer<typeof itemSpecificationsSchema>;
export type ItemLocationData = z.infer<typeof itemLocationDataSchema>;
export type ItemLocationInput = z.infer<typeof itemLocationInputSchema>;
export type ItemLocationUpdate = z.infer<typeof itemLocationUpdateSchema>;
export type ItemAttachment = z.infer<typeof itemAttachmentSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Status = z.infer<typeof statusSchema>;
export type UnitOfMeasure = z.infer<typeof unitOfMeasureSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type ItemLotData = z.infer<typeof itemLotDataSchema>;
export type Item = z.infer<typeof itemSchema>;
export type ItemDetail = z.infer<typeof itemDetailSchema>;
export type ItemCreate = z.infer<typeof itemCreateSchema>;
export type ItemUpdate = z.infer<typeof itemUpdateSchema>;
export type ItemSpecificationsEditorItem = z.infer<
  typeof itemSpecificationsEditorItemSchema
>;

import type {z} from 'zod';
import {
  itemSchema,
  itemDetailSchema,
  itemCreateSchema,
  itemUpdateSchema,
  itemFilterStateSchema,
  itemSpecificationsEditorItemSchema,
} from '../schemas';
import type {
  Item,
  ItemDetail,
  ItemCreate,
  ItemUpdate,
  ItemFilterState,
  ItemSpecificationsEditorItem,
} from '../schemas';

export function validateItem(data: unknown): z.ZodSafeParseResult<Item> {
  return itemSchema.safeParse(data);
}

export function validateItemDetail(data: unknown): z.ZodSafeParseResult<ItemDetail> {
  return itemDetailSchema.safeParse(data);
}

export function validateItemCreate(data: unknown): z.ZodSafeParseResult<ItemCreate> {
  return itemCreateSchema.safeParse(data);
}

export function validateItemUpdate(data: unknown): z.ZodSafeParseResult<ItemUpdate> {
  return itemUpdateSchema.safeParse(data);
}

export function validateItemFilterState(
  data: unknown,
): z.ZodSafeParseResult<ItemFilterState> {
  return itemFilterStateSchema.safeParse(data);
}

export function validateItemSpecificationsEditorItem(
  data: unknown,
): z.ZodSafeParseResult<ItemSpecificationsEditorItem> {
  return itemSpecificationsEditorItemSchema.safeParse(data);
}

export type {
  Item,
  ItemDetail,
  ItemCreate,
  ItemUpdate,
  ItemFilterState,
  ItemSpecificationsEditorItem,
} from '../schemas';

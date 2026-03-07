import {
  itemSchema,
  itemDetailSchema,
  itemCreateSchema,
  itemUpdateSchema,
  itemFilterStateSchema,
  itemSpecificationsEditorItemSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validateItem = createValidator(itemSchema);
export const validateItemDetail = createValidator(itemDetailSchema);
export const validateItemCreate = createValidator(itemCreateSchema);
export const validateItemUpdate = createValidator(itemUpdateSchema);
export const validateItemFilterState = createValidator(itemFilterStateSchema);
export const validateItemSpecificationsEditorItem = createValidator(
  itemSpecificationsEditorItemSchema,
);

import {
  attachmentFilterSchema,
  orderByClauseSchema,
  attachmentSortStateSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validateAttachmentFilter = createValidator(attachmentFilterSchema);
export const validateOrderByClause = createValidator(orderByClauseSchema);
export const validateAttachmentSortState = createValidator(
  attachmentSortStateSchema,
);

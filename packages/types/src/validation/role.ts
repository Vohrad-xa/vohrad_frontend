import {roleSchema, roleCreateSchema, roleUpdateSchema} from '../schemas';
import {createValidator} from './parse';

export const validateRole = createValidator(roleSchema);
export const validateRoleCreate = createValidator(roleCreateSchema);
export const validateRoleUpdate = createValidator(roleUpdateSchema);

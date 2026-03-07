import {userSchema, userUpdateDataSchema} from '../schemas';
import {createValidator} from './parse';

export const validateUser = createValidator(userSchema);
export const validateUserUpdate = createValidator(userUpdateDataSchema);

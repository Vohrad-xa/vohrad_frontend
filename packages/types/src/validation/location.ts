import {
  locationSchema,
  locationCreateSchema,
  locationUpdateSchema,
} from '../schemas';
import {createValidator} from './parse';

export const validateLocation = createValidator(locationSchema);
export const validateLocationCreate = createValidator(locationCreateSchema);
export const validateLocationUpdate = createValidator(locationUpdateSchema);

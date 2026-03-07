import {secureStoreChunkMetaSchema} from '../schemas';
import {createValidator} from './parse';

export const validateSecureStoreChunkMeta = createValidator(
  secureStoreChunkMetaSchema,
);

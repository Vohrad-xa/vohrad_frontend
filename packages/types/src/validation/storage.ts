import {secureStoreChunkMetaSchema} from '../schemas';

export function validateSecureStoreChunkMeta(meta: unknown) {
  return secureStoreChunkMetaSchema.safeParse(meta);
}

export type {SecureStoreChunkMeta} from '../schemas';

import {z} from 'zod';

export const secureStoreChunkMetaSchema = z.strictObject({
  chunks: z.number().int().positive(),
});

export type SecureStoreChunkMeta = z.infer<typeof secureStoreChunkMetaSchema>;

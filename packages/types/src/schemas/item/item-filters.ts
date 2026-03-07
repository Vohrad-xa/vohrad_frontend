import {z} from 'zod';

export const trackingModeSchema = z.enum(['abstract', 'lot', 'serialized']);

export const itemFilterStateSchema = z.strictObject({
  statuses: z.array(z.enum(['active', 'inactive'])).optional(),
  trackingModes: z.array(trackingModeSchema).optional(),
  unitIds: z.array(z.string()).optional(),
  priceMin: z.number().nullable().optional(),
  priceMax: z.number().nullable().optional(),
});

export type TrackingMode = z.infer<typeof trackingModeSchema>;
export type ItemFilterState = z.infer<typeof itemFilterStateSchema>;

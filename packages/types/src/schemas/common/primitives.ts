import {z} from 'zod';

export const nonEmptyStringSchema = z.string().trim().min(1);
export const positiveIntSchema = z.coerce.number().int().positive();
export const nonNegativeIntSchema = z.coerce.number().int().nonnegative();

export const nullishToUndefined = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
) => schema.nullish().transform((value) => value ?? undefined);

export function optionalNullable<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
) {
  return schema.nullish();
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {[key: string]: JsonValue};

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const jsonObjectSchema = z.record(z.string(), jsonValueSchema);

export const baseSchemas = {
  string: {
    required: (min = 1, max = 100) => z.string().min(min).max(max),
    optional: (min = 1, max = 100) => z.string().min(min).max(max).optional(),
  },
  number: {
    positive: () => z.number().positive(),
    min: (min: number) => z.number().min(min),
    max: (max: number) => z.number().max(max),
  },
  boolean: {
    required: () => z.boolean(),
    optional: () => z.boolean().optional(),
  },
} as const;

export const apiDecimalSchema = z
  .union([
    z.number(),
    z.string().regex(/^-?\d+(?:\.\d+)?$/, 'Invalid decimal format'),
  ])
  .transform((value) => Number(value));

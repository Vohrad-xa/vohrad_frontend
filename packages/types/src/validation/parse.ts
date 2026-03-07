import type {z} from 'zod';

export function safeParseWithSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown,
): z.ZodSafeParseResult<z.output<TSchema>> {
  return schema.safeParse(value);
}

export function createValidator<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return (value: unknown): z.ZodSafeParseResult<z.output<TSchema>> =>
    safeParseWithSchema(schema, value);
}

import {z} from 'zod';

const jsonStringSchema = z.string().transform((value, context): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    context.addIssue({
      code: 'custom',
      message: 'Invalid JSON payload',
    });
    return z.NEVER;
  }
});

export function parseJson(value: string) {
  return jsonStringSchema.safeParse(value);
}

export function parseJsonWithSchema<TSchema extends z.ZodTypeAny>(
  value: string,
  schema: TSchema,
) {
  return jsonStringSchema.pipe(schema).safeParse(value);
}

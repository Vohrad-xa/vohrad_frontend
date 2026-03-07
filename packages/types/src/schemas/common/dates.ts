import {z} from 'zod';

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');

export const isoDateTimeSchema = z
  .string()
  .refine((value) => !isNaN(Date.parse(value)), 'Invalid datetime format');

export const baseDateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date')
  .transform((date) => new Date(date).toISOString().split('T')[0]);

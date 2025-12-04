import {z} from 'zod';
import {transformations} from '../validation/helpers';

export const roleTypes = ['BASIC', 'PREDEFINED', 'CUSTOM'] as const;
export const roleScopes = ['GLOBAL', 'TENANT'] as const;
export const roleStages = [
  'ALPHA',
  'BETA',
  'GA',
  'DEPRECATED',
  'DISABLED',
] as const;

export const roleTypeSchema = z.enum(roleTypes);
export const roleScopeSchema = z.enum(roleScopes);
export const roleStageSchema = z.enum(roleStages);

const roleNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Role name must be at least 2 characters')
  .max(50, 'Role name cannot exceed 50 characters');

const roleDescriptionSchema = z
  .string()
  .max(500, 'Description cannot exceed 500 characters')
  .transform(transformations.trim)
  .optional()
  .nullable();

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  role_type: roleTypeSchema,
  role_scope: roleScopeSchema,
  stage: roleStageSchema,
  is_mutable: z.boolean(),
  permissions_mutable: z.boolean(),
  managed_by: z.string().nullable().optional(),
  is_deletable: z.boolean(),
  tenant_id: z.string().nullable().optional(),
  etag: z.string(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const roleCreateSchema = z
  .object({
    name: roleNameSchema,
    description: roleDescriptionSchema,
    role_type: roleTypeSchema.optional().default('PREDEFINED'),
    role_scope: roleScopeSchema.optional().default('TENANT'),
    stage: roleStageSchema.optional().default('GA'),
  })
  .superRefine((data, ctx) => {
    if (data.role_type === 'BASIC') {
      ctx.addIssue({
        code: 'custom',
        message: 'Basic roles can only be created by system administrators',
        path: ['role_type'],
      });
    }

    if (data.role_scope !== 'TENANT') {
      ctx.addIssue({
        code: 'custom',
        message: 'Only TENANT scope roles can be created via API',
        path: ['role_scope'],
      });
    }

    if (data.role_type !== 'CUSTOM' && data.stage && data.stage !== 'GA') {
      ctx.addIssue({
        code: 'custom',
        message: 'Stage must be GA for BASIC or PREDEFINED roles',
        path: ['stage'],
      });
    }
  });

export const roleUpdateSchema = z.object({
  name: roleNameSchema.optional().nullable(),
  description: roleDescriptionSchema,
  is_active: z.boolean().optional(),
  stage: roleStageSchema.optional(),
  etag: z.string().min(1, 'ETag is required'),
});

export type RoleType = z.infer<typeof roleTypeSchema>;
export type RoleScope = z.infer<typeof roleScopeSchema>;
export type RoleStage = z.infer<typeof roleStageSchema>;
export type Role = z.infer<typeof roleSchema>;
export type RoleCreate = z.infer<typeof roleCreateSchema>;
export type RoleUpdate = z.infer<typeof roleUpdateSchema>;

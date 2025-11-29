import {
  roleSchema,
  roleCreateSchema,
  roleUpdateSchema,
  type Role,
  type RoleCreate,
  type RoleUpdate,
} from '../schemas';

export function validateRole(data: unknown) {
  return roleSchema.safeParse(data);
}

export function validateRoleCreate(data: unknown) {
  return roleCreateSchema.safeParse(data);
}

export function validateRoleUpdate(data: unknown) {
  return roleUpdateSchema.safeParse(data);
}

export type {Role, RoleCreate, RoleUpdate};

import {
  locationSchema,
  locationCreateSchema,
  locationUpdateSchema,
  type Location,
  type LocationCreate,
  type LocationUpdate,
} from '../schemas';

export function validateLocation(data: unknown) {
  return locationSchema.safeParse(data);
}

export function validateLocationCreate(data: unknown) {
  return locationCreateSchema.safeParse(data);
}

export function validateLocationUpdate(data: unknown) {
  return locationUpdateSchema.safeParse(data);
}

export type {Location, LocationCreate, LocationUpdate};

import {describe, it, expect} from '@jest/globals';
import {randomUUID} from 'crypto';
import {validateLocation, validateLocationCreate, validateLocationUpdate, schemas} from '@sykamore/types';

const validLocation = {
  id: randomUUID(),
  name: 'Archive Row 2',
  code: 'ARCH-R2',
  parent_id: randomUUID(),
  description: 'Box files archive row 2',
  is_active: true,
  path: 'Archive Room > Row 2',
  created_at: '2026-03-02T23:07:56.366986Z',
  updated_at: '2026-03-02T23:07:56.366986Z',
};

describe('Location Validation', () => {
  describe('validateLocation (response schema)', () => {
    it('validates a full location from the API', () => {
      const result = validateLocation(validLocation);
      expect(result.success).toBe(true);
    });

    it('accepts null parent_id for root locations', () => {
      const result = validateLocation({...validLocation, parent_id: null});
      expect(result.success).toBe(true);
      expect(result.data?.parent_id).toBeNull();
    });

    it('accepts absent parent_id', () => {
      const {parent_id: _, ...rest} = validLocation;
      const result = validateLocation(rest);
      expect(result.success).toBe(true);
      expect(result.data?.parent_id).toBeUndefined();
    });

    it('accepts null description', () => {
      const result = validateLocation({...validLocation, description: null});
      expect(result.success).toBe(true);
    });

    it('accepts null path', () => {
      const result = validateLocation({...validLocation, path: null});
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = validateLocation({id: 'b8200000-0000-0000-0000-000000000001'});
      expect(result.success).toBe(false);
    });

    it('rejects invalid uuid for id', () => {
      const result = validateLocation({...validLocation, id: 'not-a-uuid'});
      expect(result.success).toBe(false);
    });

    it('rejects invalid uuid for parent_id', () => {
      const result = validateLocation({...validLocation, parent_id: 'not-a-uuid'});
      expect(result.success).toBe(false);
    });
  });

  describe('validateLocationCreate', () => {
    it('validates a minimal create payload', () => {
      const result = validateLocationCreate({name: 'Shelf A', code: 'SH-A'});
      expect(result.success).toBe(true);
    });

    it('defaults is_active to true', () => {
      const result = validateLocationCreate({name: 'Shelf A', code: 'SH-A'});
      expect(result.success).toBe(true);
      expect(result.data?.is_active).toBe(true);
    });

    it('accepts a parent_id', () => {
      const result = validateLocationCreate({
        name: 'Shelf A',
        code: 'SH-A',
        parent_id: randomUUID(),
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = validateLocationCreate({name: '', code: 'SH-A'});
      expect(result.success).toBe(false);
    });

    it('rejects empty code', () => {
      const result = validateLocationCreate({name: 'Shelf A', code: ''});
      expect(result.success).toBe(false);
    });

    it('rejects name over 255 characters', () => {
      const result = validateLocationCreate({name: 'A'.repeat(256), code: 'SH-A'});
      expect(result.success).toBe(false);
    });

    it('rejects code over 50 characters', () => {
      const result = validateLocationCreate({name: 'Shelf A', code: 'A'.repeat(51)});
      expect(result.success).toBe(false);
    });
  });

  describe('validateLocationUpdate', () => {
    it('accepts a partial update', () => {
      const result = validateLocationUpdate({name: 'New Name'});
      expect(result.success).toBe(true);
    });

    it('accepts empty object (no-op update)', () => {
      const result = validateLocationUpdate({});
      expect(result.success).toBe(true);
    });

    it('accepts is_active toggle', () => {
      const result = validateLocationUpdate({is_active: false});
      expect(result.success).toBe(true);
    });

    it('rejects name over 255 characters', () => {
      const result = validateLocationUpdate({name: 'A'.repeat(256)});
      expect(result.success).toBe(false);
    });
  });

  describe('schemas.locationSchema direct access', () => {
    it('is accessible via schemas namespace', () => {
      const result = schemas.locationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });
  });
});

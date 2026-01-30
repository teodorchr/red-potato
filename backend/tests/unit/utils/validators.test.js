import { describe, it, expect } from '@jest/globals';
import {
  clientSchema,
  clientUpdateSchema,
  loginSchema,
  registerSchema,
  validateClient,
  validateLogin,
  validateRegister,
} from '../../../src/utils/validators.js';

describe('validators', () => {
  describe('clientSchema', () => {
    const validClient = {
      name: 'Ion Popescu',
      licensePlate: 'B-123-ABC',
      phoneNumber: '+40722123456',
      email: 'ion@example.com',
      itpExpirationDate: '2024-03-15',
    };

    it('should accept valid client data', () => {
      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = clientSchema.safeParse({ ...validClient, name: 'A' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('name');
    });

    it('should reject invalid license plate format', () => {
      const result = clientSchema.safeParse({ ...validClient, licensePlate: 'INVALID' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('licensePlate');
    });

    it('should accept various valid license plate formats', () => {
      const plates = ['B-123-ABC', 'CJ-12-XYZ', 'AB-999-DEF'];
      plates.forEach((plate) => {
        const result = clientSchema.safeParse({ ...validClient, licensePlate: plate });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone number', () => {
      const result = clientSchema.safeParse({ ...validClient, phoneNumber: '123' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('phoneNumber');
    });

    it('should accept phone numbers with and without plus', () => {
      const phones = ['+40722123456', '0722123456', '40722123456'];
      phones.forEach((phone) => {
        const result = clientSchema.safeParse({ ...validClient, phoneNumber: phone });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email', () => {
      const result = clientSchema.safeParse({ ...validClient, email: 'invalid-email' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    it('should accept date string for itpExpirationDate', () => {
      const result = clientSchema.safeParse({
        ...validClient,
        itpExpirationDate: '2024-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should accept Date object for itpExpirationDate', () => {
      const result = clientSchema.safeParse({
        ...validClient,
        itpExpirationDate: new Date('2024-12-31'),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('clientUpdateSchema', () => {
    it('should allow partial updates', () => {
      const result = clientUpdateSchema.safeParse({ name: 'New Name' });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = clientUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should still validate provided fields', () => {
      const result = clientUpdateSchema.safeParse({ email: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid credentials', () => {
      const result = loginSchema.safeParse({
        username: 'admin',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = loginSchema.safeParse({
        username: 'ab',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('username');
    });

    it('should reject password shorter than 6 characters', () => {
      const result = loginSchema.safeParse({
        username: 'admin',
        password: '12345',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('password');
    });

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({ username: 'admin' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validUser = {
      username: 'newuser',
      email: 'user@example.com',
      password: 'securepass123',
    };

    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should default role to operator', () => {
      const result = registerSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      expect(result.data.rol).toBe('operator');
    });

    it('should accept admin role', () => {
      const result = registerSchema.safeParse({ ...validUser, rol: 'admin' });
      expect(result.success).toBe(true);
      expect(result.data.rol).toBe('admin');
    });

    it('should accept operator role', () => {
      const result = registerSchema.safeParse({ ...validUser, rol: 'operator' });
      expect(result.success).toBe(true);
      expect(result.data.rol).toBe('operator');
    });

    it('should reject invalid role', () => {
      const result = registerSchema.safeParse({ ...validUser, rol: 'superuser' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({ ...validUser, email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const result = registerSchema.safeParse({ ...validUser, username: 'ab' });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({ ...validUser, password: '12345' });
      expect(result.success).toBe(false);
    });
  });

  describe('validateClient', () => {
    it('should return success: true for valid data', () => {
      const result = validateClient({
        name: 'Test Client',
        licensePlate: 'B-123-ABC',
        phoneNumber: '+40722123456',
        email: 'test@example.com',
        itpExpirationDate: '2024-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should return success: false with errors for invalid data', () => {
      const result = validateClient({
        name: 'A', // Too short
        licensePlate: 'INVALID',
        phoneNumber: '123',
        email: 'not-email',
        itpExpirationDate: '2024-12-31',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
    });
  });

  describe('validateLogin', () => {
    it('should return success: true for valid credentials', () => {
      const result = validateLogin({ username: 'admin', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should return success: false for invalid credentials', () => {
      const result = validateLogin({ username: 'ab', password: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('validateRegister', () => {
    it('should return success: true for valid registration', () => {
      const result = validateRegister({
        username: 'newuser',
        email: 'user@example.com',
        password: 'securepass',
      });
      expect(result.success).toBe(true);
    });

    it('should return success: false for invalid registration', () => {
      const result = validateRegister({
        username: 'ab',
        email: 'invalid',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });
});

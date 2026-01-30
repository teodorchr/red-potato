import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhoneNumber,
  isValidPlateNumber,
  isFutureDate,
  normalizePhoneNumber,
  normalizePlateNumber,
  validateClientForm,
} from './validators.js';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject emails without @', () => {
      expect(isValidEmail('invalid-email.com')).toBe(false);
    });

    it('should reject emails without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should accept 0XXXXXXXXX format', () => {
      expect(isValidPhoneNumber('0722123456')).toBe(true);
      expect(isValidPhoneNumber('0744987654')).toBe(true);
    });

    it('should accept +4XXXXXXXXX format', () => {
      // Note: The regex expects +4 followed by 9 digits
      expect(isValidPhoneNumber('+4722123456')).toBe(true);
    });

    it('should accept 0040XXXXXXXXX format', () => {
      expect(isValidPhoneNumber('0040722123456')).toBe(true);
    });

    it('should ignore spaces in number', () => {
      expect(isValidPhoneNumber('0722 123 456')).toBe(true);
      expect(isValidPhoneNumber('+4 722 123 456')).toBe(true);
    });

    it('should reject too short numbers', () => {
      expect(isValidPhoneNumber('072212')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(isValidPhoneNumber('123456789')).toBe(false);
      expect(isValidPhoneNumber('+1234567890')).toBe(false);
    });
  });

  describe('isValidPlateNumber', () => {
    it('should accept B-123-ABC format', () => {
      expect(isValidPlateNumber('B-123-ABC')).toBe(true);
    });

    it('should accept AB-12-ABC format', () => {
      expect(isValidPlateNumber('CJ-12-XYZ')).toBe(true);
      expect(isValidPlateNumber('AB-99-DEF')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidPlateNumber('b-123-abc')).toBe(true);
      expect(isValidPlateNumber('CJ-12-xyz')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidPlateNumber('ABC123')).toBe(false);
      expect(isValidPlateNumber('B123ABC')).toBe(false);
      expect(isValidPlateNumber('B-1-ABC')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date(Date.now() + 86400000 * 30);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('should handle date strings', () => {
      const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
      expect(isFutureDate(futureDate)).toBe(true);
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should convert 0XXXXXXXXX to +40XXXXXXXXX', () => {
      expect(normalizePhoneNumber('0722123456')).toBe('+40722123456');
    });

    it('should convert 40XXXXXXXXX to +40XXXXXXXXX', () => {
      expect(normalizePhoneNumber('40722123456')).toBe('+40722123456');
    });

    it('should leave +40 numbers unchanged', () => {
      expect(normalizePhoneNumber('+40722123456')).toBe('+40722123456');
    });

    it('should remove spaces', () => {
      expect(normalizePhoneNumber('0722 123 456')).toBe('+40722123456');
    });

    it('should return original for non-matching format', () => {
      expect(normalizePhoneNumber('+1234567890')).toBe('+1234567890');
    });
  });

  describe('normalizePlateNumber', () => {
    it('should uppercase plate number', () => {
      expect(normalizePlateNumber('b-123-abc')).toBe('B-123-ABC');
    });

    it('should trim whitespace', () => {
      expect(normalizePlateNumber('  B-123-ABC  ')).toBe('B-123-ABC');
    });
  });

  describe('validateClientForm', () => {
    const validData = {
      name: 'Ion Popescu',
      licensePlate: 'B-123-ABC',
      phoneNumber: '0722123456',
      email: 'ion@example.com',
      itpExpirationDate: '2024-12-31',
    };

    it('should return isValid: true for valid data', () => {
      const result = validateClientForm(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for short name', () => {
      const result = validateClientForm({ ...validData, name: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should return errors for missing name', () => {
      const result = validateClientForm({ ...validData, name: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should return errors for invalid license plate', () => {
      const result = validateClientForm({ ...validData, licensePlate: 'INVALID' });
      expect(result.isValid).toBe(false);
      expect(result.errors.licensePlate).toBeDefined();
    });

    it('should return errors for missing license plate', () => {
      const result = validateClientForm({ ...validData, licensePlate: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.licensePlate).toBeDefined();
    });

    it('should return errors for invalid phone', () => {
      const result = validateClientForm({ ...validData, phoneNumber: '123' });
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBeDefined();
    });

    it('should return errors for missing phone', () => {
      const result = validateClientForm({ ...validData, phoneNumber: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBeDefined();
    });

    it('should return errors for invalid email', () => {
      const result = validateClientForm({ ...validData, email: 'not-an-email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return errors for missing email', () => {
      const result = validateClientForm({ ...validData, email: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return errors for missing ITP date', () => {
      const result = validateClientForm({ ...validData, itpExpirationDate: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.itpExpirationDate).toBeDefined();
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = validateClientForm({
        name: '',
        licensePlate: '',
        phoneNumber: '',
        email: '',
        itpExpirationDate: '',
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(5);
    });
  });
});

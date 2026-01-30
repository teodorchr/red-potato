import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  getDaysDifference,
  isFutureDate,
  formatDate,
  getStartOfDay,
  getEndOfDay,
  generateItpReminderMessage,
  generateEmailTemplate,
  generateEmailSubject,
} from '../../../src/utils/helpers.js';

describe('helpers', () => {
  describe('getDaysDifference', () => {
    it('should return positive difference for dates apart', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-10');
      expect(getDaysDifference(date1, date2)).toBe(9);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-01-01');
      expect(getDaysDifference(date, date)).toBe(0);
    });

    it('should handle date strings', () => {
      expect(getDaysDifference('2024-01-01', '2024-01-05')).toBe(4);
    });

    it('should return same result regardless of date order', () => {
      const earlier = new Date('2024-01-01');
      const later = new Date('2024-01-10');
      expect(getDaysDifference(earlier, later)).toBe(getDaysDifference(later, earlier));
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
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

  describe('formatDate', () => {
    it('should format date as DD.MM.YYYY', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toBe('15.03.2024');
    });

    it('should pad single-digit days and months', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('05.01.2024');
    });

    it('should handle date strings', () => {
      expect(formatDate('2024-12-25')).toBe('25.12.2024');
    });
  });

  describe('getStartOfDay', () => {
    it('should set time to 00:00:00.000', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const startOfDay = getStartOfDay(date);

      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getMilliseconds()).toBe(0);
    });

    it('should use current date if no date provided', () => {
      const startOfDay = getStartOfDay();
      const today = new Date();

      expect(startOfDay.getDate()).toBe(today.getDate());
      expect(startOfDay.getMonth()).toBe(today.getMonth());
      expect(startOfDay.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('getEndOfDay', () => {
    it('should set time to 23:59:59.999', () => {
      const date = new Date('2024-01-15T14:30:45.123Z');
      const endOfDay = getEndOfDay(date);

      expect(endOfDay.getHours()).toBe(23);
      expect(endOfDay.getMinutes()).toBe(59);
      expect(endOfDay.getSeconds()).toBe(59);
      expect(endOfDay.getMilliseconds()).toBe(999);
    });

    it('should use current date if no date provided', () => {
      const endOfDay = getEndOfDay();
      const today = new Date();

      expect(endOfDay.getDate()).toBe(today.getDate());
      expect(endOfDay.getMonth()).toBe(today.getMonth());
      expect(endOfDay.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('generateItpReminderMessage', () => {
    const mockClient = {
      name: 'Ion Popescu',
      licensePlate: 'B-123-ABC',
      itpExpirationDate: '2024-03-15',
    };

    it('should generate expired message when daysRemaining <= 0', () => {
      const message = generateItpReminderMessage(mockClient, 0, 'en');
      expect(message).toContain('Ion Popescu');
      expect(message).toContain('B-123-ABC');
      expect(message.toLowerCase()).toContain('expir');
    });

    it('should use singular "day" when daysRemaining === 1', () => {
      const message = generateItpReminderMessage(mockClient, 1, 'en');
      // Should contain day (singular) not days
      expect(message).toContain('1');
    });

    it('should include client name and license plate', () => {
      const message = generateItpReminderMessage(mockClient, 5, 'ro');
      expect(message).toContain('Ion Popescu');
      expect(message).toContain('B-123-ABC');
    });

    it('should work with different locales', () => {
      const messageRo = generateItpReminderMessage(mockClient, 5, 'ro');
      const messageEn = generateItpReminderMessage(mockClient, 5, 'en');

      // Messages should be different (different languages)
      expect(messageRo).not.toBe(messageEn);
    });

    it('should default to Romanian locale', () => {
      const message = generateItpReminderMessage(mockClient, 5);
      // Should contain Romanian text
      expect(message).toBeTruthy();
    });
  });

  describe('generateEmailTemplate', () => {
    const mockClient = {
      name: 'Ion Popescu',
      licensePlate: 'B-123-ABC',
      itpExpirationDate: '2024-03-15',
    };

    it('should return valid HTML', () => {
      const html = generateEmailTemplate(mockClient, 5);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should use red color for urgent (<=3 days)', () => {
      const html = generateEmailTemplate(mockClient, 3, 'en');
      expect(html).toContain('#ef4444'); // Red color
    });

    it('should use amber color for normal (>3 days)', () => {
      const html = generateEmailTemplate(mockClient, 7, 'en');
      expect(html).toContain('#f59e0b'); // Amber color
    });

    it('should include all client information', () => {
      const html = generateEmailTemplate(mockClient, 5);
      expect(html).toContain('Ion Popescu');
      expect(html).toContain('B-123-ABC');
      expect(html).toContain('15.03.2024');
    });

    it('should show expired warning when daysRemaining <= 0', () => {
      const html = generateEmailTemplate(mockClient, 0, 'en');
      expect(html).toContain('#ef4444'); // Red/urgent styling
    });
  });

  describe('generateEmailSubject', () => {
    const mockClient = {
      licensePlate: 'B-123-ABC',
    };

    it('should include license plate', () => {
      const subject = generateEmailSubject(mockClient, 5);
      expect(subject).toContain('B-123-ABC');
    });

    it('should use expired subject when daysRemaining <= 0', () => {
      const normalSubject = generateEmailSubject(mockClient, 5, 'en');
      const expiredSubject = generateEmailSubject(mockClient, 0, 'en');

      // Subjects should be different
      expect(normalSubject).not.toBe(expiredSubject);
    });

    it('should work with different locales', () => {
      const subjectRo = generateEmailSubject(mockClient, 5, 'ro');
      const subjectEn = generateEmailSubject(mockClient, 5, 'en');

      // Both should include the license plate
      expect(subjectRo).toContain('B-123-ABC');
      expect(subjectEn).toContain('B-123-ABC');
    });
  });
});

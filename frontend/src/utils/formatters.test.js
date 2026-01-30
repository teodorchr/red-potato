import { describe, it, expect, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatPlateNumber,
  getDaysRemainingClass,
  getDaysRemainingText,
  formatNotificationStatus,
  getNotificationStatusClass,
  formatNotificationType,
} from './formatters.js';

// Mock i18n
vi.mock('../i18n', () => ({
  default: {
    language: 'en',
  },
}));

describe('formatters', () => {
  describe('formatDate', () => {
    it('should return "-" for null/undefined', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate(undefined)).toBe('-');
    });

    it('should format ISO date string to DD.MM.YYYY', () => {
      expect(formatDate('2024-03-15T10:00:00.000Z')).toBe('15.03.2024');
    });

    it('should return "-" for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('should return "-" for null/undefined', () => {
      expect(formatDateTime(null)).toBe('-');
      expect(formatDateTime(undefined)).toBe('-');
    });

    it('should format to DD.MM.YYYY HH:mm', () => {
      const result = formatDateTime('2024-03-15T10:30:00.000Z');
      expect(result).toMatch(/15\.03\.2024/);
    });

    it('should return "-" for invalid date', () => {
      expect(formatDateTime('not-a-date')).toBe('-');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should return "-" for null', () => {
      expect(formatPhoneNumber(null)).toBe('-');
      expect(formatPhoneNumber(undefined)).toBe('-');
    });

    it('should format +40 numbers to 0XXX format', () => {
      expect(formatPhoneNumber('+40722123456')).toBe('0722 123 456');
    });

    it('should format 10-digit numbers with spaces', () => {
      expect(formatPhoneNumber('0722123456')).toBe('0722 123 456');
    });

    it('should return original if not matching format', () => {
      expect(formatPhoneNumber('+1234567890')).toBe('+1234567890');
    });
  });

  describe('formatPlateNumber', () => {
    it('should return "-" for null', () => {
      expect(formatPlateNumber(null)).toBe('-');
      expect(formatPlateNumber(undefined)).toBe('-');
    });

    it('should uppercase plate number', () => {
      expect(formatPlateNumber('b-123-abc')).toBe('B-123-ABC');
    });
  });

  describe('getDaysRemainingClass', () => {
    it('should return badge-danger for negative days', () => {
      expect(getDaysRemainingClass(-1)).toBe('badge-danger');
      expect(getDaysRemainingClass(-10)).toBe('badge-danger');
    });

    it('should return badge-danger for <= 3 days', () => {
      expect(getDaysRemainingClass(0)).toBe('badge-danger');
      expect(getDaysRemainingClass(1)).toBe('badge-danger');
      expect(getDaysRemainingClass(3)).toBe('badge-danger');
    });

    it('should return badge-warning for <= 7 days', () => {
      expect(getDaysRemainingClass(4)).toBe('badge-warning');
      expect(getDaysRemainingClass(7)).toBe('badge-warning');
    });

    it('should return badge-success for > 7 days', () => {
      expect(getDaysRemainingClass(8)).toBe('badge-success');
      expect(getDaysRemainingClass(30)).toBe('badge-success');
    });
  });

  describe('getDaysRemainingText', () => {
    it('should return "EXPIRED" for negative days without t', () => {
      expect(getDaysRemainingText(-1)).toBe('EXPIRED');
    });

    it('should return "Today" for 0 days without t', () => {
      expect(getDaysRemainingText(0)).toBe('Today');
    });

    it('should return "N days" for positive without t', () => {
      expect(getDaysRemainingText(5)).toBe('5 days');
    });

    it('should use translation function if provided', () => {
      const mockT = vi.fn((key, opts) => {
        if (key === 'status.expired') return 'Expirat';
        if (key === 'status.today') return 'Astazi';
        if (key === 'status.daysLeft') return `${opts.count} zile`;
        return key;
      });

      expect(getDaysRemainingText(-1, mockT)).toBe('Expirat');
      expect(getDaysRemainingText(0, mockT)).toBe('Astazi');
      expect(getDaysRemainingText(5, mockT)).toBe('5 zile');
    });
  });

  describe('formatNotificationStatus', () => {
    it('should map status to display text without t', () => {
      expect(formatNotificationStatus('sent')).toBe('Sent');
      expect(formatNotificationStatus('failed')).toBe('Failed');
      expect(formatNotificationStatus('pending')).toBe('Pending');
    });

    it('should return original for unknown status', () => {
      expect(formatNotificationStatus('unknown')).toBe('unknown');
    });

    it('should use translation function if provided', () => {
      const mockT = vi.fn((key) => {
        if (key === 'notifications.sent') return 'Trimis';
        if (key === 'notifications.failed') return 'Esuat';
        return key;
      });

      expect(formatNotificationStatus('sent', mockT)).toBe('Trimis');
      expect(formatNotificationStatus('failed', mockT)).toBe('Esuat');
    });
  });

  describe('getNotificationStatusClass', () => {
    it('should return correct class for each status', () => {
      expect(getNotificationStatusClass('sent')).toBe('badge-success');
      expect(getNotificationStatusClass('failed')).toBe('badge-danger');
      expect(getNotificationStatusClass('pending')).toBe('badge-warning');
    });

    it('should return badge-info for unknown status', () => {
      expect(getNotificationStatusClass('unknown')).toBe('badge-info');
    });
  });

  describe('formatNotificationType', () => {
    it('should map type to display text without t', () => {
      expect(formatNotificationType('SMS')).toBe('SMS');
      expect(formatNotificationType('EMAIL')).toBe('Email');
      expect(formatNotificationType('BOTH')).toBe('SMS & Email');
    });

    it('should return original for unknown type', () => {
      expect(formatNotificationType('PUSH')).toBe('PUSH');
    });

    it('should use translation function if provided', () => {
      const mockT = vi.fn((key) => {
        if (key === 'notifications.sms') return 'SMS';
        if (key === 'notifications.email') return 'E-mail';
        return key;
      });

      expect(formatNotificationType('EMAIL', mockT)).toBe('E-mail');
      expect(formatNotificationType('BOTH', mockT)).toBe('SMS & E-mail');
    });
  });
});

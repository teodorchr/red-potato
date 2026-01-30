import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock nodemailer and config
const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn(),
};

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => mockTransporter),
  },
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
  default: {
    email: {
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      user: 'test@test.com',
      password: 'test-password',
      from: 'Service Auto <noreply@test.com>',
    },
  },
}));

// Import after mocking
const { sendEmail, verifyEmailConnection } = await import(
  '../../../src/services/emailService.js'
);

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email with correct parameters', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<test@message.id>',
        accepted: ['recipient@example.com'],
        rejected: [],
      });

      const result = await sendEmail(
        'recipient@example.com',
        'Test Subject',
        '<p>Test HTML</p>',
        'Test text'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'Service Auto <noreply@test.com>',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
      });
      expect(result.success).toBe(true);
    });

    it('should strip HTML for text fallback when text not provided', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<test@message.id>',
        accepted: ['recipient@example.com'],
        rejected: [],
      });

      await sendEmail(
        'recipient@example.com',
        'Test Subject',
        '<p>Test <strong>content</strong></p>'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test content', // HTML stripped
        })
      );
    });

    it('should throw error on email failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(
        new Error('SMTP connection failed')
      );

      await expect(
        sendEmail('test@example.com', 'Subject', '<p>HTML</p>')
      ).rejects.toThrow('Email sending failed: SMTP connection failed');
    });

    it('should return success result structure', async () => {
      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<test@message.id>',
        accepted: ['recipient@example.com'],
        rejected: [],
      });

      const result = await sendEmail(
        'recipient@example.com',
        'Test Subject',
        '<p>Test</p>'
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('messageId');
      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('rejected');
    });
  });

  describe('verifyEmailConnection', () => {
    it('should return true on successful verification', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await verifyEmailConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should return false on verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection refused'));

      const result = await verifyEmailConnection();

      expect(result).toBe(false);
    });
  });
});

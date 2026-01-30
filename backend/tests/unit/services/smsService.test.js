import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock twilio and config
const mockTwilioClient = {
  messages: {
    create: jest.fn(),
  },
};

const mockTwilioMessages = jest.fn();

jest.unstable_mockModule('twilio', () => ({
  default: jest.fn(() => mockTwilioClient),
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
  default: {
    twilio: {
      accountSid: 'test-sid',
      authToken: 'test-token',
      phoneNumber: '+15551234567',
    },
  },
}));

// Import after mocking
const { sendSMS, checkSMSStatus } = await import('../../../src/services/smsService.js');

describe('smsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSMS', () => {
    it('should send SMS with correct parameters', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM123456',
        status: 'queued',
        to: '+40722123456',
        body: 'Test message',
      });

      const result = await sendSMS('+40722123456', 'Test message');

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        body: 'Test message',
        from: '+15551234567',
        to: '+40722123456',
      });
      expect(result.success).toBe(true);
      expect(result.sid).toBe('SM123456');
    });

    it('should add +4 prefix for numbers starting with 0', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM123456',
        status: 'queued',
        to: '+40722123456',
        body: 'Test message',
      });

      await sendSMS('0722123456', 'Test message');

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+40722123456',
        })
      );
    });

    it('should throw error on SMS failure', async () => {
      mockTwilioClient.messages.create.mockRejectedValue(
        new Error('Invalid phone number')
      );

      await expect(sendSMS('+40722123456', 'Test')).rejects.toThrow(
        'SMS sending failed: Invalid phone number'
      );
    });

    it('should return success result structure', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM123456',
        status: 'sent',
        to: '+40722123456',
        body: 'Test message',
      });

      const result = await sendSMS('+40722123456', 'Test message');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('sid');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('to');
      expect(result).toHaveProperty('body');
    });
  });
});

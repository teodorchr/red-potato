import { jest } from '@jest/globals';

// Create mock for Twilio client
export const twilioMock = {
  messages: {
    create: jest.fn().mockResolvedValue({
      sid: 'SM12345678901234567890123456789012',
      status: 'queued',
      to: '+40722000000',
      body: 'Test message',
    }),
  },
};

// Mock the twilio module
export const createTwilioMock = () => {
  return jest.fn(() => twilioMock);
};

export default twilioMock;

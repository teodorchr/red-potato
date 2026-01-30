import { jest } from '@jest/globals';

// Create mock transporter
export const transporterMock = {
  sendMail: jest.fn().mockResolvedValue({
    messageId: '<test@message.id>',
    accepted: ['test@example.com'],
    rejected: [],
  }),
  verify: jest.fn().mockResolvedValue(true),
};

// Create mock for nodemailer module
export const nodemailerMock = {
  createTransport: jest.fn(() => transporterMock),
};

export default nodemailerMock;

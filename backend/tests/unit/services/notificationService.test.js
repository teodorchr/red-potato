import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the dependencies
const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockSendSMS = jest.fn();
const mockSendEmail = jest.fn();

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../../../src/services/smsService.js', () => ({
  sendSMS: mockSendSMS,
}));

jest.unstable_mockModule('../../../src/services/emailService.js', () => ({
  sendEmail: mockSendEmail,
}));

// Import after mocking
const {
  sendSMSNotification,
  sendEmailNotification,
  sendBothNotifications,
  getClientNotifications,
  getNotificationStats,
} = await import('../../../src/services/notificationService.js');

describe('notificationService', () => {
  const mockClient = {
    id: 'client-123',
    name: 'Ion Popescu',
    numarTelefon: '+40722123456',
    email: 'ion@example.com',
    licensePlate: 'B-123-ABC',
    itpExpirationDate: '2024-03-15',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSMSNotification', () => {
    it('should generate message and call sendSMS', async () => {
      mockSendSMS.mockResolvedValue({ success: true, sid: 'SM123' });
      mockPrisma.notification.create.mockResolvedValue({});

      const result = await sendSMSNotification(mockClient, 5);

      expect(mockSendSMS).toHaveBeenCalledWith(
        mockClient.numarTelefon,
        expect.any(String)
      );
      expect(result.success).toBe(true);
    });

    it('should save notification to database on success', async () => {
      mockSendSMS.mockResolvedValue({ success: true, sid: 'SM123' });
      mockPrisma.notification.create.mockResolvedValue({});

      await sendSMSNotification(mockClient, 5);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: mockClient.id,
          type: 'SMS',
          status: 'sent',
          message: expect.any(String),
          sentAt: expect.any(Date),
        }),
      });
    });

    it('should save failed notification on error', async () => {
      const error = new Error('SMS service unavailable');
      mockSendSMS.mockRejectedValue(error);
      mockPrisma.notification.create.mockResolvedValue({});

      await expect(sendSMSNotification(mockClient, 5)).rejects.toThrow(
        'SMS service unavailable'
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: mockClient.id,
          type: 'SMS',
          status: 'failed',
          error: 'SMS service unavailable',
        }),
      });
    });

    it('should rethrow the error after logging', async () => {
      const error = new Error('Network error');
      mockSendSMS.mockRejectedValue(error);
      mockPrisma.notification.create.mockResolvedValue({});

      await expect(sendSMSNotification(mockClient, 5)).rejects.toThrow('Network error');
    });
  });

  describe('sendEmailNotification', () => {
    it('should generate subject with days remaining', async () => {
      mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockPrisma.notification.create.mockResolvedValue({});

      await sendEmailNotification(mockClient, 5);

      expect(mockSendEmail).toHaveBeenCalledWith(
        mockClient.email,
        expect.stringContaining('5'),
        expect.any(String)
      );
    });

    it('should use singular "day" when daysRemaining === 1', async () => {
      mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockPrisma.notification.create.mockResolvedValue({});

      await sendEmailNotification(mockClient, 1);

      expect(mockSendEmail).toHaveBeenCalledWith(
        mockClient.email,
        expect.stringContaining('1 day'),
        expect.any(String)
      );
    });

    it('should use urgent subject when expired', async () => {
      mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockPrisma.notification.create.mockResolvedValue({});

      await sendEmailNotification(mockClient, 0);

      expect(mockSendEmail).toHaveBeenCalledWith(
        mockClient.email,
        expect.stringContaining('EXPIRED'),
        expect.any(String)
      );
    });

    it('should save notification to database on success', async () => {
      mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' });
      mockPrisma.notification.create.mockResolvedValue({});

      await sendEmailNotification(mockClient, 5);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: mockClient.id,
          type: 'EMAIL',
          status: 'sent',
        }),
      });
    });

    it('should save failed notification on error', async () => {
      const error = new Error('Email service unavailable');
      mockSendEmail.mockRejectedValue(error);
      mockPrisma.notification.create.mockResolvedValue({});

      await expect(sendEmailNotification(mockClient, 5)).rejects.toThrow(
        'Email service unavailable'
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: mockClient.id,
          type: 'EMAIL',
          status: 'failed',
          error: 'Email service unavailable',
        }),
      });
    });
  });

  describe('sendBothNotifications', () => {
    it('should attempt both SMS and Email', async () => {
      mockSendSMS.mockResolvedValue({ success: true });
      mockSendEmail.mockResolvedValue({ success: true });
      mockPrisma.notification.create.mockResolvedValue({});

      const results = await sendBothNotifications(mockClient, 5);

      expect(mockSendSMS).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
      expect(results.sms.success).toBe(true);
      expect(results.email.success).toBe(true);
    });

    it('should return partial success if SMS fails', async () => {
      mockSendSMS.mockRejectedValue(new Error('SMS failed'));
      mockSendEmail.mockResolvedValue({ success: true });
      mockPrisma.notification.create.mockResolvedValue({});

      const results = await sendBothNotifications(mockClient, 5);

      expect(results.sms.success).toBe(false);
      expect(results.sms.error).toBe('SMS failed');
      expect(results.email.success).toBe(true);
    });

    it('should return partial success if Email fails', async () => {
      mockSendSMS.mockResolvedValue({ success: true });
      mockSendEmail.mockRejectedValue(new Error('Email failed'));
      mockPrisma.notification.create.mockResolvedValue({});

      const results = await sendBothNotifications(mockClient, 5);

      expect(results.sms.success).toBe(true);
      expect(results.email.success).toBe(false);
      expect(results.email.error).toBe('Email failed');
    });

    it('should return both failures if both fail', async () => {
      mockSendSMS.mockRejectedValue(new Error('SMS failed'));
      mockSendEmail.mockRejectedValue(new Error('Email failed'));
      mockPrisma.notification.create.mockResolvedValue({});

      const results = await sendBothNotifications(mockClient, 5);

      expect(results.sms.success).toBe(false);
      expect(results.email.success).toBe(false);
    });

    it('should not throw even if both fail', async () => {
      mockSendSMS.mockRejectedValue(new Error('SMS failed'));
      mockSendEmail.mockRejectedValue(new Error('Email failed'));
      mockPrisma.notification.create.mockResolvedValue({});

      await expect(sendBothNotifications(mockClient, 5)).resolves.toBeDefined();
    });
  });

  describe('getClientNotifications', () => {
    it('should return notifications ordered by date desc', async () => {
      const mockNotifications = [
        { id: '1', sentAt: new Date('2024-03-15') },
        { id: '2', sentAt: new Date('2024-03-10') },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await getClientNotifications('client-123');

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-123' },
        orderBy: { sentAt: 'desc' },
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getNotificationStats', () => {
    it('should return counts by status and type', async () => {
      mockPrisma.notification.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // sent
        .mockResolvedValueOnce(15) // failed
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(60) // sms
        .mockResolvedValueOnce(40); // email

      const stats = await getNotificationStats();

      expect(stats).toEqual({
        total: 100,
        byStatus: { sent: 80, failed: 15, pending: 5 },
        byType: { sms: 60, email: 40 },
      });
    });
  });
});

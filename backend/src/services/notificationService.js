import prisma from '../config/database.js';
import { sendSMS } from './smsService.js';
import { sendEmail } from './emailService.js';
import { generateItpReminderMessage, generateEmailTemplate } from '../utils/helpers.js';

/**
 * Send SMS notification to client
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {Promise<object>}
 */
export const sendSMSNotification = async (client, daysRemaining) => {
  const message = generateItpReminderMessage(client, daysRemaining);

  try {
    const result = await sendSMS(client.numarTelefon, message);

    // Save notification to database
    await prisma.notification.create({
      data: {
        clientId: client.id,
        type: 'SMS',
        status: 'sent',
        message: message,
        sentAt: new Date(),
      },
    });

    return { success: true, result };
  } catch (error) {
    // Save failed notification to database
    await prisma.notification.create({
      data: {
        clientId: client.id,
        type: 'SMS',
        status: 'failed',
        message: message,
        error: error.message,
      },
    });

    throw error;
  }
};

/**
 * Send Email notification to client
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {Promise<object>}
 */
export const sendEmailNotification = async (client, daysRemaining) => {
  const subject = daysRemaining <= 0
    ? '🚨 ITP EXPIRED - Urgent Action Required'
    : `🚗 ITP Reminder - ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} until expiration`;

  const html = generateEmailTemplate(client, daysRemaining);

  try {
    const result = await sendEmail(client.email, subject, html);

    // Save notification to database
    await prisma.notification.create({
      data: {
        clientId: client.id,
        type: 'EMAIL',
        status: 'sent',
        message: subject,
        sentAt: new Date(),
      },
    });

    return { success: true, result };
  } catch (error) {
    // Save failed notification to database
    await prisma.notification.create({
      data: {
        clientId: client.id,
        type: 'EMAIL',
        status: 'failed',
        message: subject,
        error: error.message,
      },
    });

    throw error;
  }
};

/**
 * Send both notifications (SMS and Email) to client
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days remaining until expiration
 * @returns {Promise<object>}
 */
export const sendBothNotifications = async (client, daysRemaining) => {
  const results = {
    sms: { success: false, error: null },
    email: { success: false, error: null },
  };

  // Send SMS
  try {
    await sendSMSNotification(client, daysRemaining);
    results.sms.success = true;
  } catch (error) {
    results.sms.error = error.message;
    console.error(`Failed to send SMS to ${client.name}:`, error.message);
  }

  // Send Email
  try {
    await sendEmailNotification(client, daysRemaining);
    results.email.success = true;
  } catch (error) {
    results.email.error = error.message;
    console.error(`Failed to send Email to ${client.name}:`, error.message);
  }

  return results;
};

/**
 * Get notification history for a client
 * @param {string} clientId - Client ID
 * @returns {Promise<Array>}
 */
export const getClientNotifications = async (clientId) => {
  return await prisma.notification.findMany({
    where: { clientId },
    orderBy: { sentAt: 'desc' },
  });
};

/**
 * Get notification statistics
 * @returns {Promise<object>}
 */
export const getNotificationStats = async () => {
  const total = await prisma.notification.count();
  const sent = await prisma.notification.count({ where: { status: 'sent' } });
  const failed = await prisma.notification.count({ where: { status: 'failed' } });
  const pending = await prisma.notification.count({ where: { status: 'pending' } });

  const smsCount = await prisma.notification.count({ where: { type: 'SMS' } });
  const emailCount = await prisma.notification.count({ where: { type: 'EMAIL' } });

  return {
    total,
    byStatus: { sent, failed, pending },
    byType: { sms: smsCount, email: emailCount },
  };
};

export default {
  sendSMSNotification,
  sendEmailNotification,
  sendBothNotifications,
  getClientNotifications,
  getNotificationStats,
};

import prisma from '../config/database.js';
import {
  sendSMSNotification,
  sendEmailNotification,
  sendBothNotifications,
  getNotificationStats,
} from '../services/notificationService.js';
import { getDaysDifference } from '../utils/helpers.js';

/**
 * Get all notifications
 * GET /api/notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = '',
      status = '',
      clientId = '',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const total = await prisma.notification.count({ where });

    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { sentAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send test notification to a client
 * POST /api/notifications/test
 */
export const sendTestNotification = async (req, res, next) => {
  try {
    const { clientId, type } = req.body; // type: 'SMS', 'EMAIL', or 'BOTH'

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (new Date(client.itpExpirationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    let result = {};

    switch (type) {
      case 'SMS':
        result = await sendSMSNotification(client, daysRemaining);
        break;

      case 'EMAIL':
        result = await sendEmailNotification(client, daysRemaining);
        break;

      case 'BOTH':
        result = await sendBothNotifications(client, daysRemaining);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid notification type. Use: SMS, EMAIL, or BOTH',
        });
    }

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics
 * GET /api/notifications/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await getNotificationStats();

    // Get recent notifications
    const recentNotifications = await prisma.notification.findMany({
      take: 5,
      orderBy: { sentAt: 'desc' },
      include: {
        client: {
          select: {
            name: true,
            name: true,
            licensePlate: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...stats,
        recent: recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for a specific client
 * GET /api/notifications/client/:clientId
 */
export const getClientNotifications = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const notifications = await prisma.notification.findMany({
      where: { clientId },
      orderBy: { sentAt: 'desc' },
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retry failed notification
 * POST /api/notifications/:id/retry
 */
export const retryNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    const daysRemaining = Math.ceil(
      (new Date(notification.client.itpExpirationDate) - new Date()) /
      (1000 * 60 * 60 * 24)
    );

    let result;

    if (notification.tip === 'SMS') {
      result = await sendSMSNotification(notification.client, daysRemaining);
    } else if (notification.tip === 'EMAIL') {
      result = await sendEmailNotification(notification.client, daysRemaining);
    }

    res.json({
      success: true,
      message: 'Notification resent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  sendTestNotification,
  getStats,
  getClientNotifications,
  retryNotification,
};

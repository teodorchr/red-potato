import prisma from '../config/database.js';
import config from '../config/env.js';

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + config.cron.itpReminderDays);
    sevenDaysLater.setHours(23, 59, 59, 999);

    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    thirtyDaysLater.setHours(23, 59, 59, 999);

    // Total active clients
    const totalClients = await prisma.client.count({
      where: { activ: true },
    });

    // Clients with expired ITP
    const expiredCount = await prisma.client.count({
      where: {
        activ: true,
        dataExpirareItp: {
          lt: today,
        },
      },
    });

    // Clients with ITP expiring in the next 7 days
    const expiringSoonCount = await prisma.client.count({
      where: {
        activ: true,
        dataExpirareItp: {
          gte: today,
          lte: sevenDaysLater,
        },
      },
    });

    // Clients with ITP expiring in the next 30 days
    const expiringThirtyDaysCount = await prisma.client.count({
      where: {
        activ: true,
        dataExpirareItp: {
          gte: today,
          lte: thirtyDaysLater,
        },
      },
    });

    // Notifications sent today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const notificationsSentToday = await prisma.notification.count({
      where: {
        status: 'sent',
        dataTrimitere: {
          gte: startOfToday,
        },
      },
    });

    // Failed notifications today
    const notificationsFailedToday = await prisma.notification.count({
      where: {
        status: 'failed',
        dataTrimitere: {
          gte: startOfToday,
        },
      },
    });

    // Recently added clients
    const recentClients = await prisma.client.findMany({
      where: { activ: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nume: true,
        numarInmatriculare: true,
        dataExpirareItp: true,
        createdAt: true,
      },
    });

    // Clients with upcoming expiration (next 7 days)
    const upcomingExpirations = await prisma.client.findMany({
      where: {
        activ: true,
        dataExpirareItp: {
          gte: today,
          lte: sevenDaysLater,
        },
      },
      orderBy: { dataExpirareItp: 'asc' },
      select: {
        id: true,
        nume: true,
        numarInmatriculare: true,
        dataExpirareItp: true,
        numarTelefon: true,
        email: true,
      },
    });

    // Add days remaining for each client
    const upcomingWithDays = upcomingExpirations.map((client) => ({
      ...client,
      daysRemaining: Math.ceil(
        (new Date(client.dataExpirareItp) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalClients,
          expiredCount,
          expiringSoonCount,
          expiringThirtyDaysCount,
        },
        notifications: {
          sentToday: notificationsSentToday,
          failedToday: notificationsFailedToday,
        },
        recentClients,
        upcomingExpirations: upcomingWithDays,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
};

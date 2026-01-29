import prisma from '../config/database.js';
import config from '../config/env.js';
import { sendBothNotifications } from '../services/notificationService.js';
import { getStartOfDay, getEndOfDay } from '../utils/helpers.js';

/**
 * Job for checking and sending ITP notifications
 * Runs daily at 08:00
 */
export const checkAndNotifyExpiringITP = async () => {
  console.log('🔔 Starting ITP reminder job...');
  console.log(`⏰ Time: ${new Date().toISOString()}`);

  try {
    const today = new Date();
    const reminderDays = config.cron.itpReminderDays;

    // Calculate deadline date (today + N days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + reminderDays);

    console.log(`📅 Checking for ITP expiring in the next ${reminderDays} days`);
    console.log(`   From: ${today.toLocaleDateString('ro-RO')}`);
    console.log(`   To: ${futureDate.toLocaleDateString('ro-RO')}`);

    // Find all cars with ITP expiring in the next N days
    const expiringClients = await prisma.client.findMany({
      where: {
        activ: true,
        dataExpirareItp: {
          gte: getStartOfDay(today),
          lte: getEndOfDay(futureDate),
        },
      },
      orderBy: {
        dataExpirareItp: 'asc',
      },
    });

    console.log(`📋 Found ${expiringClients.length} clients with expiring ITP`);

    if (expiringClients.length === 0) {
      console.log('✅ No clients found. Job completed.');
      return {
        success: true,
        message: 'No clients with expiring ITP',
        count: 0,
      };
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process each client
    for (const client of expiringClients) {
      try {
        // Check if client has already received notification today
        const notificationSentToday = await prisma.notification.findFirst({
          where: {
            clientId: client.id,
            dataTrimitere: {
              gte: getStartOfDay(today),
              lte: getEndOfDay(today),
            },
            status: 'sent',
          },
        });

        if (notificationSentToday) {
          console.log(`⏭️  Skipping ${client.nume} - Already notified today`);
          results.push({
            client: client.nume,
            status: 'skipped',
            reason: 'Already notified today',
          });
          continue;
        }

        // Calculate days remaining until expiration
        const daysRemaining = Math.ceil(
          (new Date(client.dataExpirareItp) - today) / (1000 * 60 * 60 * 24)
        );

        console.log(
          `📤 Sending notifications to ${client.nume} (${client.numarInmatriculare}) - ${daysRemaining} days remaining`
        );

        // Send both notifications (SMS and Email)
        const notificationResults = await sendBothNotifications(client, daysRemaining);

        const success =
          notificationResults.sms.success || notificationResults.email.success;

        if (success) {
          successCount++;
          results.push({
            client: client.nume,
            status: 'success',
            daysRemaining,
            sms: notificationResults.sms.success ? 'sent' : 'failed',
            email: notificationResults.email.success ? 'sent' : 'failed',
          });
          console.log(`✅ Successfully sent notifications to ${client.nume}`);
        } else {
          failureCount++;
          results.push({
            client: client.nume,
            status: 'failed',
            daysRemaining,
            errors: {
              sms: notificationResults.sms.error,
              email: notificationResults.email.error,
            },
          });
          console.error(`❌ Failed to send notifications to ${client.nume}`);
        }

        // Short pause between notifications to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        failureCount++;
        console.error(`❌ Error processing client ${client.nume}:`, error.message);
        results.push({
          client: client.nume,
          status: 'error',
          error: error.message,
        });
      }
    }

    console.log('═'.repeat(60));
    console.log('📊 ITP Reminder Job Summary:');
    console.log(`   Total clients processed: ${expiringClients.length}`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log('═'.repeat(60));

    return {
      success: true,
      message: 'ITP reminder job completed',
      summary: {
        totalClients: expiringClients.length,
        successCount,
        failureCount,
      },
      results,
    };
  } catch (error) {
    console.error('❌ ITP reminder job failed:', error);
    return {
      success: false,
      message: 'ITP reminder job failed',
      error: error.message,
    };
  }
};

export default checkAndNotifyExpiringITP;

import cron from 'node-cron';
import config from '../config/env.js';
import checkAndNotifyExpiringITP from './itp-reminder.js';
import prisma from '../config/database.js';

/**
 * Initialize and start all cronjobs
 */
export const initScheduler = () => {
  if (!config.cron.enabled) {
    console.log('⏸️  Cronjobs are disabled in configuration');
    return;
  }

  console.log('🚀 Initializing cronjobs...');
  console.log(`   Timezone: ${config.cron.timezone}`);
  console.log(`   ITP Reminder Days: ${config.cron.itpReminderDays}`);

  // Cronjob for ITP check - runs daily at 08:00
  const itpReminderJob = cron.schedule(
    '0 8 * * *', // At 08:00 every day
    async () => {
      console.log('\n' + '═'.repeat(60));
      console.log('🔔 Running scheduled ITP reminder job');
      console.log('═'.repeat(60));

      try {
        await checkAndNotifyExpiringITP();
      } catch (error) {
        console.error('❌ Cronjob execution failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: config.cron.timezone,
    },
  );

  console.log('✅ Cronjob "ITP Reminder" scheduled successfully');
  console.log('   Schedule: Every day at 08:00');
  console.log('   Next run:', getNextRunTime(itpReminderJob));

  // Optional: Cronjob for cleaning old notifications (monthly)
  const cleanupJob = cron.schedule(
    '0 0 1 * *', // First day of each month at 00:00
    async () => {
      console.log('\n' + '═'.repeat(60));
      console.log('🧹 Running scheduled cleanup job');
      console.log('═'.repeat(60));

      try {
        // Delete notifications older than 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await prisma.notification.deleteMany({
          where: {
            dataTrimitere: {
              lt: sixMonthsAgo,
            },
          },
        });

        console.log(`✅ Cleanup completed. Deleted ${result.count} old notifications.`);
      } catch (error) {
        console.error('❌ Cleanup job failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: config.cron.timezone,
    },
  );

  console.log('✅ Cronjob "Cleanup" scheduled successfully');
  console.log('   Schedule: First day of each month at 00:00');
  console.log('   Next run:', getNextRunTime(cleanupJob));

  return {
    itpReminderJob,
    cleanupJob,
  };
};

/**
 * Stop all cronjobs
 */
export const stopScheduler = (jobs) => {
  if (jobs.itpReminderJob) {
    jobs.itpReminderJob.stop();
    console.log('⏹️  ITP Reminder job stopped');
  }

  if (jobs.cleanupJob) {
    jobs.cleanupJob.stop();
    console.log('⏹️  Cleanup job stopped');
  }
};

/**
 * Run ITP reminder job manually (for testing)
 */
export const runItpReminderManually = async () => {
  console.log('🔧 Running ITP reminder job manually...');
  return await checkAndNotifyExpiringITP();
};

/**
 * Helper to display the next scheduled run
 */
const getNextRunTime = (_cronJob) => {
  // node-cron doesn't provide an API for next run time, return a generic message
  return 'Check cron schedule for next run time';
};

export default {
  initScheduler,
  stopScheduler,
  runItpReminderManually,
};

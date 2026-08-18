const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { sendReminderEmail } = require('../utils/email');

// Run every day at 8:00 AM
const startReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily reminder cron job...');
    try {
      // Find users who have courses marked as IN_PROGRESS
      // To simulate "more than 7 days", we would normally check the updatedAt date of the Progress record
      // For this implementation, we will just find all IN_PROGRESS courses that haven't been updated in 7 days
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const staleProgresses = await prisma.progress.findMany({
        where: {
          status: 'IN_PROGRESS',
          updatedAt: {
            lt: sevenDaysAgo
          }
        },
        include: {
          user: true,
          course: true
        }
      });

      console.log(`Found ${staleProgresses.length} users with stale progress.`);

      for (const progress of staleProgresses) {
        const { user, course } = progress;
        const userEmail = `${user.name.toLowerCase().replace(/\s+/g, '.')}@LMS.gov.pk`;
        
        await sendReminderEmail(userEmail, user.name, course.title);
      }
      
      console.log('Daily reminder job completed.');
    } catch (error) {
      console.error('Error running daily reminder job:', error);
    }
  });
  console.log('Reminder cron job scheduled.');
};

module.exports = startReminderJob;

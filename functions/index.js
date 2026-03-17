/**
 * SecondBrain Cloud Function
 *
 * Runs every minute via Cloud Scheduler, checks for due reminders,
 * and sends push notifications via FCM to the user's devices.
 *
 * Deploy with: firebase deploy --only functions
 *
 * Prerequisites:
 *   1. firebase login
 *   2. firebase init functions (select your secondbrainwebapp project)
 *   3. firebase deploy --only functions
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Runs every minute to check for due reminders
exports.sendScheduledReminders = onSchedule('every 1 minutes', async (event) => {
  const now = new Date();
  const usersSnapshot = await db.collection('users').get();

  for (const userDoc of usersSnapshot.docs) {
    try {
      // Get the user's scheduled reminders
      const remindersDoc = await userDoc.ref
        .collection('reminders')
        .doc('scheduled')
        .get();

      if (!remindersDoc.exists) continue;

      const { upcoming } = remindersDoc.data();
      if (!upcoming || !upcoming.length) continue;

      // Get the user's push tokens
      const tokensSnapshot = await userDoc.ref
        .collection('pushTokens')
        .get();

      const tokens = tokensSnapshot.docs.map((d) => d.data().token).filter(Boolean);
      if (tokens.length === 0) continue;

      // Find reminders that are due (within the last 2 minutes to account for timing)
      const twoMinAgo = new Date(now.getTime() - 120000);
      let updated = false;

      for (const reminder of upcoming) {
        if (reminder.sent) continue;
        const triggerTime = new Date(reminder.triggerTime);

        if (triggerTime <= now && triggerTime >= twoMinAgo) {
          // Send push to all user devices
          const message = {
            tokens,
            notification: {
              title: 'SecondBrain Reminder',
              body: `${reminder.title}\n${reminder.body}`,
            },
            data: {
              noteId: reminder.noteId,
              url: '/Sergio/',
            },
            webpush: {
              notification: {
                requireInteraction: 'true',
                vibrate: [200, 100, 200],
                icon: '/Sergio/favicon.ico',
              },
            },
          };

          try {
            await admin.messaging().sendEachForMulticast(message);
            reminder.sent = true;
            updated = true;
            console.log(`Sent reminder: ${reminder.title} to user ${userDoc.id}`);
          } catch (sendErr) {
            console.error(`Failed to send to user ${userDoc.id}:`, sendErr);
          }
        }
      }

      // Update the sent status
      if (updated) {
        await remindersDoc.ref.update({ upcoming });
      }
    } catch (userErr) {
      console.error(`Error processing user ${userDoc.id}:`, userErr);
    }
  }
});

// server/scheduler.js
const cron = require('node-cron');
const admin = require('./config/firebase');
const userDataUtils = require('./utils/userDataUtils');
const logger = require('./utils/logger');

// Function to clean up archived users
const cleanupArchivedUsers = async () => {
  try {
    logger.info('Running scheduled cleanup of archived users...');
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Find all users archived more than 30 days ago
    const archivesRef = admin.firestore().collection('archives');
    const snapshot = await archivesRef
      .where('itemType', '==', 'user')
      .where('archivedAt', '<=', thirtyDaysAgo)
      .get();
    
    if (snapshot.empty) {
      logger.info('No archived users to clean up');
      return;
    }
    
    logger.info(`Found ${snapshot.size} archived users to permanently delete`);
    
    // Process each expired archived user
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const uid = userData.originalId;
      
      if (uid) {
        logger.info(`Permanently deleting user ${uid} after 30 days in archive`);
        await userDataUtils.permanentlyDeleteUser(uid);
      }
    }
    
    logger.info('Successfully cleaned up expired archived users');
  } catch (error) {
    logger.error('Error in cleanup process:', error);
  }
};

// Schedule task to run at midnight every day
const initScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled archive cleanup task');
    await cleanupArchivedUsers();
  });
  
  logger.info('Archive cleanup scheduler initialized');
};

module.exports = { 
  initScheduler,
  cleanupArchivedUsers
};
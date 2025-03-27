// server/utils/userDataUtils.js
const admin = require('../config/firebase');
const logger = require('./logger');

// Collections that may contain user-related data
const userRelatedCollections = [
  'appointments',
  'notifications',
  'userPreferences',
  'userActivity',
  // Add other collections as needed
];

/**
 * Generate a consistent user ID from Firebase UID
 * @param {string} uid - Firebase UID
 * @returns {string} - Formatted user ID
 */
const generateUserId = (uid) => {
  return `user_${uid.substring(0, 8)}`;
};

/**
 * Archive a user and their related data
 * @param {string} uid - User ID to archive
 * @returns {Object} - Result of the archive operation
 */
exports.archiveUser = async (uid) => {
  try {
    logger.info(`Starting archive process for user: ${uid}`);
    
    // Check if user exists in Firebase Auth
    try {
      await admin.auth().getUser(uid);
    } catch (authError) {
      logger.error(`User ${uid} not found in Firebase Auth: ${authError.message}`);
      return {
        success: false,
        message: `User not found in Firebase Auth: ${authError.message}`
      };
    }
    
    // Generate the correct user ID format for Firestore
    const userId = generateUserId(uid);
    logger.info(`Looking for user document with ID: ${userId}`);
    
    // Get user data from Firestore
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      logger.error(`User ${uid} not found in Firestore with ID ${userId}`);
      return {
        success: false,
        message: 'User not found in Firestore'
      };
    }
    
    // Get user data
    const userData = userDoc.data();
    
    // Prepare user data for archiving
    const archiveData = {
      itemType: 'user',
      originalId: uid,
      ...userData,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      archiveReason: 'user_deleted'
    };
    
    // Use the same document ID as in the users collection
    const archiveId = userId;
    
    // Save to archives collection with the same ID
    await admin.firestore().collection('archives').doc(archiveId).set(archiveData);
    logger.info(`User ${uid} saved to archives with ID: ${archiveId}`);
    
    // Archive related data from other collections
    const archivedRelatedData = await archiveUserRelatedData(uid);
    
    // IMPORTANT: Delete the user document from the users collection
    await userRef.delete();
    logger.info(`User ${uid} deleted from users collection`);
    
    // Disable user in Firebase Auth
    await admin.auth().updateUser(uid, { disabled: true });
    logger.info(`User ${uid} disabled in Firebase Auth`);
    
    return {
      success: true,
      message: 'User archived successfully',
      archiveId,
      relatedDataArchived: archivedRelatedData
    };
  } catch (error) {
    logger.error(`Error archiving user: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Archive user-related data from other collections
 * @param {string} uid - User ID
 * @returns {Object} - Summary of archived data
 */
const archiveUserRelatedData = async (uid) => {
  const summary = {};
  
  for (const collectionName of userRelatedCollections) {
    try {
      const collectionRef = admin.firestore().collection(collectionName);
      const snapshot = await collectionRef.where('userId', '==', uid).get();
      
      if (snapshot.empty) {
        logger.info(`No ${collectionName} found for user ${uid}`);
        summary[collectionName] = 0;
        continue;
      }
      
      let count = 0;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const archiveData = {
          itemType: collectionName,
          originalId: doc.id,
          ...data,
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          archiveReason: 'user_deleted'
        };
        
        // Use the same document ID for the archive
        const archiveId = doc.id;
        
        // Save to archives
        await admin.firestore().collection('archives').doc(archiveId).set(archiveData);
        
        // IMPORTANT: Delete the document from the original collection
        await doc.ref.delete();
        
        count++;
      }
      
      logger.info(`Archived ${count} ${collectionName} for user ${uid}`);
      summary[collectionName] = count;
    } catch (error) {
      logger.error(`Error archiving ${collectionName} for user ${uid}: ${error.message}`);
      summary[collectionName] = `Error: ${error.message}`;
    }
  }
  
  return summary;
};

/**
 * Restore a user from archive
 * @param {string} uid - User ID to restore
 * @returns {Object} - Result of the restore operation
 */
exports.restoreUser = async (uid) => {
  try {
    logger.info(`Starting restore process for user: ${uid}`);
    
    // Generate the correct user ID format for Firestore
    const userId = generateUserId(uid);
    
    // Find the user in archives using the same ID format
    const archiveRef = admin.firestore().collection('archives').doc(userId);
    const archiveDoc = await archiveRef.get();
    
    if (!archiveDoc.exists) {
      logger.error(`User ${uid} not found in archives with ID ${userId}`);
      return {
        success: false,
        message: 'User not found in archives'
      };
    }
    
    const archiveData = archiveDoc.data();
    
    // Prepare user data for restoration
    const userData = { ...archiveData };
    
    // Remove archive-specific fields
    delete userData.itemType;
    delete userData.originalId;
    delete userData.archivedAt;
    delete userData.archiveReason;
    
    // Update user status
    userData.status = 'active';
    userData.restoredAt = admin.firestore.FieldValue.serverTimestamp();
    
    // IMPORTANT: Create a new document in the users collection with the same ID
    await admin.firestore().collection('users').doc(userId).set(userData);
    logger.info(`User ${uid} restored to users collection with ID ${userId}`);
    
    // Enable user in Firebase Auth
    await admin.auth().updateUser(uid, { disabled: false });
    logger.info(`User ${uid} enabled in Firebase Auth`);
    
    // Restore related data
    const restoredRelatedData = await restoreUserRelatedData(uid);
    
    // Delete from archives
    await archiveRef.delete();
    logger.info(`User ${uid} removed from archives`);
    
    return {
      success: true,
      message: 'User restored successfully',
      relatedDataRestored: restoredRelatedData
    };
  } catch (error) {
    logger.error(`Error restoring user: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Restore user-related data from archives
 * @param {string} uid - User ID
 * @returns {Object} - Summary of restored data
 */
const restoreUserRelatedData = async (uid) => {
  const summary = {};
  
  for (const collectionName of userRelatedCollections) {
    try {
      // Find archived items for this collection and user
      const archivesRef = admin.firestore().collection('archives');
      const snapshot = await archivesRef.where('itemType', '==', collectionName)
                                       .where('userId', '==', uid)
                                       .get();
      
      if (snapshot.empty) {
        logger.info(`No archived ${collectionName} found for user ${uid}`);
        summary[collectionName] = 0;
        continue;
      }
      
      let count = 0;
      for (const doc of snapshot.docs) {
        const archiveData = doc.data();
        const originalId = archiveData.originalId;
        
        // Prepare data for restoration
        const itemData = { ...archiveData };
        
        // Remove archive-specific fields
        delete itemData.itemType;
        delete itemData.originalId;
        delete itemData.archivedAt;
        delete itemData.archiveReason;
        
        // Update status
        itemData.status = 'active';
        itemData.restoredAt = admin.firestore.FieldValue.serverTimestamp();
        
        // IMPORTANT: Create a new document in the original collection with the original ID
        await admin.firestore().collection(collectionName).doc(originalId).set(itemData);
        
        // Delete from archives
        await doc.ref.delete();
        
        count++;
      }
      
      logger.info(`Restored ${count} ${collectionName} for user ${uid}`);
      summary[collectionName] = count;
    } catch (error) {
      logger.error(`Error restoring ${collectionName} for user ${uid}: ${error.message}`);
      summary[collectionName] = `Error: ${error.message}`;
    }
  }
  
  return summary;
};

/**
 * Permanently delete a user and their data
 * @param {string} uid - User ID to delete
 * @returns {Object} - Result of the delete operation
 */
exports.permanentlyDeleteUser = async (uid) => {
  try {
    logger.info(`Starting permanent deletion process for user: ${uid}`);
    
    // Generate the correct user ID format for Firestore
    const userId = generateUserId(uid);
    
    // Find the user in archives using the same ID format
    const archiveRef = admin.firestore().collection('archives').doc(userId);
    const archiveDoc = await archiveRef.get();
    
    if (!archiveDoc.exists) {
      logger.error(`User ${uid} not found in archives with ID ${userId}`);
      return {
        success: false,
        message: 'User not found in archives'
      };
    }
    
    // Delete user from Firebase Auth
    try {
      await admin.auth().deleteUser(uid);
      logger.info(`User ${uid} deleted from Firebase Auth`);
    } catch (authError) {
      // If user doesn't exist in Auth, just log it and continue
      logger.warn(`User ${uid} not found in Firebase Auth for deletion: ${authError.message}`);
    }
    
    // Delete user from archives
    await archiveRef.delete();
    logger.info(`User ${uid} deleted from archives`);
    
    // Delete related data from archives
    const deletedRelatedData = await deleteUserRelatedDataFromArchives(uid);
    
    return {
      success: true,
      message: 'User permanently deleted',
      deletedFromArchives: deletedRelatedData
    };
  } catch (error) {
    logger.error(`Error permanently deleting user: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Delete user-related data from archives
 * @param {string} uid - User ID
 * @returns {Object} - Summary of deleted data
 */
const deleteUserRelatedDataFromArchives = async (uid) => {
  const summary = {};
  
  for (const collectionName of userRelatedCollections) {
    try {
      const archivesRef = admin.firestore().collection('archives');
      const snapshot = await archivesRef.where('itemType', '==', collectionName)
                                       .where('userId', '==', uid)
                                       .get();
      
      if (snapshot.empty) {
        logger.info(`No archived ${collectionName} found for user ${uid}`);
        summary[collectionName] = 0;
        continue;
      }
      
      let count = 0;
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        count++;
      }
      
      logger.info(`Deleted ${count} ${collectionName} from archives for user ${uid}`);
      summary[collectionName] = count;
    } catch (error) {
      logger.error(`Error deleting ${collectionName} from archives for user ${uid}: ${error.message}`);
      summary[collectionName] = `Error: ${error.message}`;
    }
  }
  
  return summary;
};
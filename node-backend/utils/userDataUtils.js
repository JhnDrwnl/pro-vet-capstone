// server/utils/userDataUtils.js
const admin = require('../config/firebase');
const logger = require('./logger');

// Collections that may contain user-related data
const userRelatedCollections = [
  'appointments',
  'notifications',
  'userPreferences',
  'userActivity',
  'pets' // Ensure pets collection is in the list
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
    
    // Prepare user data for archiving - IMPORTANT: Include ALL original fields
    const archiveData = {
      itemType: 'user',
      originalId: userId, // Store the formatted user ID
      uid: uid, // Store the original Firebase UID
      ...userData, // Include ALL user data fields
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      archiveReason: 'user_deleted'
    };
    
    // Use the same document ID as in the users collection
    const archiveId = userId;
    
    // Save to archives collection with the same ID
    await admin.firestore().collection('archives').doc(archiveId).set(archiveData);
    logger.info(`User ${uid} saved to archives with ID: ${archiveId}`);
    
    // Archive related data from other collections
    // IMPORTANT: Pass both the raw UID and the formatted userId
    const archivedRelatedData = await archiveUserRelatedData(uid, userId);
    
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
 * @param {string} uid - Firebase UID
 * @param {string} userId - Formatted user ID (user_XXXXXXXX)
 * @returns {Object} - Summary of archived data
 */
const archiveUserRelatedData = async (uid, userId) => {
  const summary = {};
  
  // First, handle pets collection separately since it uses ownerId
  try {
    // IMPORTANT: Find pets for this user using the formatted userId
    // This is because in the pet store, ownerId is stored as the formatted userId
    const petsRef = admin.firestore().collection('pets');
    const petsSnapshot = await petsRef.where('ownerId', '==', userId).get();
    
    if (petsSnapshot.empty) {
      logger.info(`No pets found for user ${userId}`);
      summary['pets'] = 0;
    } else {
      let count = 0;
      for (const doc of petsSnapshot.docs) {
        const petData = doc.data();
        const petId = doc.id;
        
        logger.info(`Found pet with ID ${petId} for user ${userId}`);
        
        // Prepare data for archiving - IMPORTANT: Include ALL original fields
        const archiveData = {
          ...petData,
          itemType: 'pet',
          originalId: petId,
          ownerId: userId, // Preserve the formatted userId
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          archiveReason: 'user_deleted'
        };
        
        // Store in archives collection with a unique ID
        const archiveId = `pet_${petId}`;
        await admin.firestore().collection('archives').doc(archiveId).set(archiveData);
        logger.info(`Pet ${petId} archived with ID: ${archiveId}`);
        
        // Delete from original collection
        await doc.ref.delete();
        logger.info(`Pet ${petId} deleted from pets collection`);
        
        count++;
      }
      
      logger.info(`Archived ${count} pets for user ${userId}`);
      summary['pets'] = count;
    }
  } catch (error) {
    logger.error(`Error archiving pets for user ${userId}: ${error.message}`);
    summary['pets'] = `Error: ${error.message}`;
  }
  
  // Now handle other collections that use userId field
  for (const collectionName of userRelatedCollections) {
    // Skip pets as we already handled it
    if (collectionName === 'pets') continue;
    
    try {
      const collectionRef = admin.firestore().collection(collectionName);
      
      // Try both the raw UID and formatted userId for maximum compatibility
      const snapshot1 = await collectionRef.where('userId', '==', uid).get();
      const snapshot2 = await collectionRef.where('userId', '==', userId).get();
      
      // Combine results
      const docs = [...snapshot1.docs];
      snapshot2.docs.forEach(doc => {
        if (!docs.some(existingDoc => existingDoc.id === doc.id)) {
          docs.push(doc);
        }
      });
      
      if (docs.length === 0) {
        logger.info(`No ${collectionName} found for user ${uid} or ${userId}`);
        summary[collectionName] = 0;
        continue;
      }
      
      let count = 0;
      for (const doc of docs) {
        const data = doc.data();
        const archiveData = {
          itemType: collectionName,
          originalId: doc.id,
          ...data,
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          archiveReason: 'user_deleted'
        };
        
        // Use a unique ID for the archive to avoid conflicts
        const archiveId = `${collectionName}_${doc.id}`;
        
        // Save to archives
        await admin.firestore().collection('archives').doc(archiveId).set(archiveData);
        
        // IMPORTANT: Delete the document from the original collection
        await doc.ref.delete();
        
        count++;
      }
      
      logger.info(`Archived ${count} ${collectionName} for user ${uid}/${userId}`);
      summary[collectionName] = count;
    } catch (error) {
      logger.error(`Error archiving ${collectionName} for user ${uid}/${userId}: ${error.message}`);
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
    
    // Prepare user data for restoration - IMPORTANT: Preserve ALL original user data
    const userData = { ...archiveData };
    
    // Remove only the archive-specific fields
    delete userData.itemType;
    delete userData.originalId;
    delete userData.archivedAt;
    delete userData.archiveReason;
    
    // Update user status
    userData.status = 'active';
    userData.restoredAt = admin.firestore.FieldValue.serverTimestamp();
    
    // IMPORTANT: Create a new document in the users collection with the same ID
    // This ensures ALL profile data is restored, not just basic auth data
    await admin.firestore().collection('users').doc(userId).set(userData);
    logger.info(`User ${uid} restored to users collection with ID ${userId}`);
    
    // Enable user in Firebase Auth
    await admin.auth().updateUser(uid, { disabled: false });
    logger.info(`User ${uid} enabled in Firebase Auth`);
    
    // Restore related data - pass both the raw UID and formatted userId
    const restoredRelatedData = await restoreUserRelatedData(uid, userId);
    
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
 * @param {string} uid - Firebase UID
 * @param {string} userId - Formatted user ID (user_XXXXXXXX)
 * @returns {Object} - Summary of restored data
 */
const restoreUserRelatedData = async (uid, userId) => {
  const summary = {};
  
  // First, handle pets collection separately since it uses ownerId
  try {
    // Find archived pets for this user using the formatted userId
    const archivesRef = admin.firestore().collection('archives');
    const petsSnapshot = await archivesRef.where('itemType', '==', 'pet')
                                        .where('ownerId', '==', userId)
                                        .get();
    
    if (petsSnapshot.empty) {
      logger.info(`No archived pets found for user ${userId}`);
      summary['pets'] = 0;
    } else {
      let count = 0;
      for (const doc of petsSnapshot.docs) {
        const archiveData = doc.data();
        const originalId = archiveData.originalId;
        
        logger.info(`Found archived pet with original ID ${originalId} for user ${userId}`);
        
        // Prepare data for restoration - IMPORTANT: Preserve ALL original pet data
        const petData = { ...archiveData };
        
        // Remove only the archive-specific fields
        delete petData.itemType;
        delete petData.originalId;
        delete petData.archivedAt;
        delete petData.archiveReason;
        
        // Update status
        petData.status = 'active';
        petData.restoredAt = admin.firestore.FieldValue.serverTimestamp();
        
        // Create a new document in the pets collection with the original ID
        await admin.firestore().collection('pets').doc(originalId).set(petData);
        logger.info(`Pet ${originalId} restored to pets collection`);
        
        // Delete from archives
        await doc.ref.delete();
        logger.info(`Pet archive ${doc.id} deleted from archives`);
        
        count++;
      }
      
      logger.info(`Restored ${count} pets for user ${userId}`);
      summary['pets'] = count;
    }
  } catch (error) {
    logger.error(`Error restoring pets for user ${userId}: ${error.message}`);
    summary['pets'] = `Error: ${error.message}`;
  }
  
  // Now handle other collections that use userId field
  for (const collectionName of userRelatedCollections) {
    // Skip pets as we already handled it
    if (collectionName === 'pets') continue;
    
    try {
      // Find archived items for this collection and user
      const archivesRef = admin.firestore().collection('archives');
      
      // Try both the raw UID and formatted userId for maximum compatibility
      const snapshot1 = await archivesRef.where('itemType', '==', collectionName)
                                      .where('userId', '==', uid)
                                      .get();
      const snapshot2 = await archivesRef.where('itemType', '==', collectionName)
                                       .where('userId', '==', userId)
                                       .get();
      
      // Combine results
      const docs = [...snapshot1.docs];
      snapshot2.docs.forEach(doc => {
        if (!docs.some(existingDoc => existingDoc.id === doc.id)) {
          docs.push(doc);
        }
      });
      
      if (docs.length === 0) {
        logger.info(`No archived ${collectionName} found for user ${uid}/${userId}`);
        summary[collectionName] = 0;
        continue;
      }
      
      let count = 0;
      for (const doc of docs) {
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
      
      logger.info(`Restored ${count} ${collectionName} for user ${uid}/${userId}`);
      summary[collectionName] = count;
    } catch (error) {
      logger.error(`Error restoring ${collectionName} for user ${uid}/${userId}: ${error.message}`);
      summary[collectionName] = `Error: ${error.message}`;
    }
  }
  
  return summary;
};

/**
 * Delete user related data from archives
 * @param {string} uid - User ID
 * @param {string} userId - Formatted user ID
 * @returns {Object} - Result of deletion operations
 */
const deleteUserRelatedDataFromArchives = async (uid, userId) => {
  try {
    logger.info(`Deleting related data for user: ${uid} (formatted: ${userId})`);
    
    const summary = {};
    const db = admin.firestore();
    
    // First, handle pets separately since they use ownerId
    try {
      // Find archived pets for this user using the formatted userId
      const petsQuery = await db.collection('archives')
        .where('itemType', '==', 'pet')
        .where('ownerId', '==', userId)
        .get();
      
      if (!petsQuery.empty) {
        const batch = db.batch();
        petsQuery.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        logger.info(`Deleted ${petsQuery.size} archived pets for user ${userId}`);
        summary['pets'] = petsQuery.size;
      } else {
        logger.info(`No archived pets found for user ${userId}`);
        summary['pets'] = 0;
      }
    } catch (error) {
      logger.error(`Error deleting archived pets: ${error.message}`);
      summary['pets'] = `Error: ${error.message}`;
    }
    
    // Now handle other collections
    for (const collectionName of userRelatedCollections) {
      // Skip pets as we already handled it
      if (collectionName === 'pets') continue;
      
      try {
        // Try both the raw UID and formatted userId for maximum compatibility
        const query1 = await db.collection('archives')
          .where('itemType', '==', collectionName)
          .where('userId', '==', uid)
          .get();
          
        const query2 = await db.collection('archives')
          .where('itemType', '==', collectionName)
          .where('userId', '==', userId)
          .get();
        
        // Combine results (avoiding duplicates)
        const docsToDelete = [...query1.docs];
        query2.docs.forEach(doc => {
          if (!docsToDelete.some(existingDoc => existingDoc.id === doc.id)) {
            docsToDelete.push(doc);
          }
        });
        
        if (docsToDelete.length > 0) {
          // Use batched writes for efficiency
          const batch = db.batch();
          docsToDelete.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          
          logger.info(`Deleted ${docsToDelete.length} archived ${collectionName} for user ${uid}/${userId}`);
          summary[collectionName] = docsToDelete.length;
        } else {
          logger.info(`No archived ${collectionName} found for user ${uid}/${userId}`);
          summary[collectionName] = 0;
        }
      } catch (error) {
        logger.error(`Error deleting archived ${collectionName}: ${error.message}`);
        summary[collectionName] = `Error: ${error.message}`;
      }
    }
    
    return {
      success: true,
      deletedItems: summary
    };
  } catch (error) {
    logger.error(`Error deleting related data: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Permanently delete a user and their data
 * @param {string} uid - User ID to delete
 * @returns {Object} - Result of the delete operation
 */
exports.permanentlyDeleteUser = async (uid) => {
  try {
    logger.info(`Starting permanent deletion process for user: ${uid}`);
    
    // Check if uid already has the "user_" prefix to avoid double prefixing
    const userId = uid.startsWith('user_') ? uid : generateUserId(uid);
    
    // Find the user in archives using the correct ID format
    const archiveRef = admin.firestore().collection('archives').doc(userId);
    const archiveDoc = await archiveRef.get();
    
    // First, try to delete the user from Firebase Auth
    try {
      // Make sure we're using the raw UID (without any prefix) for Firebase Auth operations
      const rawUid = uid.startsWith('user_') ? uid.replace('user_', '') : uid;
      
      // Log the exact UID we're trying to delete
      logger.info(`Attempting to delete user from Firebase Auth with UID: ${rawUid}`);
      
      // Force delete the user from Firebase Auth - not just disable
      await admin.auth().deleteUser(rawUid);
      logger.info(`User ${rawUid} successfully deleted from Firebase Auth`);
    } catch (authError) {
      logger.error(`Error deleting user from Firebase Auth: ${authError.message}`);
      
      // If the user doesn't exist in Auth, we can continue with deleting from Firestore
      if (authError.code === 'auth/user-not-found') {
        logger.warn(`User ${uid} not found in Firebase Auth - continuing with Firestore deletion`);
      } else {
        // For other errors, we should throw and stop the process
        throw new Error(`Failed to delete user from Firebase Auth: ${authError.message}`);
      }
    }
    
    // Now handle the Firestore document deletion
    if (!archiveDoc.exists) {
      logger.error(`User ${uid} not found in archives with ID ${userId}`);
      
      // Try to find the user by querying for the uid field
      const archivesRef = admin.firestore().collection('archives');
      const query = await archivesRef
        .where('itemType', '==', 'user')
        .where('uid', '==', uid)
        .limit(1)
        .get();
      
      if (query.empty) {
        // Try one more approach - look for any document with matching originalId
        const originalIdQuery = await archivesRef
          .where('itemType', '==', 'user')
          .where('originalId', '==', userId)
          .limit(1)
          .get();
          
        if (originalIdQuery.empty) {
          return {
            success: false,
            message: 'User not found in archives'
          };
        }
        
        // Use the document found by originalId query
        const docByOriginalId = originalIdQuery.docs[0];
        logger.info(`Found user in archives by originalId query: ${docByOriginalId.id}`);
        
        // Delete from archives
        await docByOriginalId.ref.delete();
        logger.info(`User deleted from archives: ${docByOriginalId.id}`);
        
        // Delete related data
        const deletedRelatedData = await deleteUserRelatedDataFromArchives(uid, userId);
        
        return {
          success: true,
          message: 'User permanently deleted',
          deletedFromAuth: true,
          deletedFromArchives: deletedRelatedData
        };
      }
      
      // Use the document found by uid query
      const docByUid = query.docs[0];
      logger.info(`Found user in archives by uid query: ${docByUid.id}`);
      
      // Delete from archives
      await docByUid.ref.delete();
      logger.info(`User deleted from archives: ${docByUid.id}`);
      
      // Delete related data
      const deletedRelatedData = await deleteUserRelatedDataFromArchives(uid, userId);
      
      return {
        success: true,
        message: 'User permanently deleted',
        deletedFromAuth: true,
        deletedFromArchives: deletedRelatedData
      };
    }
    
    // Original code path continues if document exists
    // Delete user from archives
    await archiveRef.delete();
    logger.info(`User ${uid} deleted from archives`);
    
    // Delete related data from archives
    const deletedRelatedData = await deleteUserRelatedDataFromArchives(uid, userId);
    
    return {
      success: true,
      message: 'User permanently deleted',
      deletedFromAuth: true,
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

// Export the functions so they can be used elsewhere
exports.generateUserId = generateUserId;
exports.deleteUserRelatedDataFromArchives = deleteUserRelatedDataFromArchives;
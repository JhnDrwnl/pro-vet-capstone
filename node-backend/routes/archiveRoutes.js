// server/routes/archiveRoutes.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const userDataUtils = require('../utils/userDataUtils');
const logger = require('../utils/logger');

// Route to get all archived users
router.get('/archived-users', async (req, res) => {
  try {
    const db = admin.firestore();
    const archivesRef = db.collection('archives');
    const snapshot = await archivesRef.where('itemType', '==', 'user').get();
    
    if (snapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        users: [] 
      });
    }
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    logger.error('Error fetching archived users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch archived users',
      error: error.message
    });
  }
});

// Route to restore a user from archive
router.post('/restore-user', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    logger.info(`Restoring user with ID: ${uid}`);
    
    // Restore the user and related data
    const restoreResult = await userDataUtils.restoreUser(uid);
    
    if (!restoreResult.success) {
      throw new Error(restoreResult.message);
    }
    
    return res.status(200).json({
      success: true,
      message: 'User restored successfully',
      data: restoreResult
    });
  } catch (error) {
    logger.error('Error restoring user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore user',
      error: error.message
    });
  }
});

// Route to permanently delete a user
router.delete('/permanently-delete-user', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    logger.info(`Permanently deleting user with ID: ${uid}`);
    
    // Log the exact uid being passed to the function for debugging
    console.log('Calling permanentlyDeleteUser with uid:', uid);
    
    // Permanently delete the user and related data
    const deleteResult = await userDataUtils.permanentlyDeleteUser(uid);
    
    if (!deleteResult.success) {
      // If the error is that the user wasn't found in archives, but we still want to
      // consider this a "success" since the end result is the same (user is gone)
      if (deleteResult.message && deleteResult.message.includes('not found in archives')) {
        return res.status(200).json({
          success: true,
          message: 'User was already deleted from archives',
          data: { alreadyDeleted: true }
        });
      }
      
      throw new Error(deleteResult.message);
    }
    
    return res.status(200).json({
      success: true,
      message: 'User permanently deleted',
      data: deleteResult
    });
  } catch (error) {
    logger.error('Error permanently deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to permanently delete user',
      error: error.message
    });
  }
});

module.exports = router;
// src/server/controllers/profileController.js
const axios = require('axios');
const admin = require('firebase-admin');
const logger = require('../utils/logger');

exports.getProfilePhoto = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!uid) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    logger.info(`Getting profile photo for user: ${uid}`);
    
    // Get the user from Firestore
    let userDoc;
    try {
      // Extract raw uid (remove 'user_' prefix if present)
      const rawUid = uid.startsWith('user_') ? uid.substring(5) : uid;
      
      // First check if user exists in Authentication
      const userRecord = await admin.auth().getUser(rawUid);
      if (!userRecord) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get user document from Firestore
      const userId = `user_${rawUid.substring(0, 8)}`;
      userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }
    } catch (error) {
      logger.error(`Error fetching user record: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Error retrieving user data' });
    }
    
    const userData = userDoc.data();
    
    // Return the photo URL if it exists
    if (userData.photoURL) {
      return res.json({ 
        success: true, 
        photoURL: userData.photoURL
      });
    } else {
      return res.json({ 
        success: false, 
        message: 'No profile photo found for this user' 
      });
    }
  } catch (error) {
    logger.error(`Error in getProfilePhoto: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error retrieving profile photo'
    });
  }
};

exports.syncGooglePhoto = async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    logger.info(`Syncing Google photo for user: ${uid}`);
    
    // Get the user from Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
    } catch (error) {
      logger.error(`Error fetching user auth record: ${error.message}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // If no photo URL, return error
    if (!userRecord.photoURL) {
      return res.status(404).json({ success: false, message: 'No photo URL found for this user' });
    }
    
    // Check if it's a Google photo
    if (!userRecord.photoURL.startsWith('https://lh3.googleusercontent.com')) {
      return res.status(400).json({ success: false, message: 'Not a Google photo URL' });
    }
    
    // Update the user's Firestore document with the photo URL
    try {
      const userId = `user_${uid.substring(0, 8)}`;
      await admin.firestore().collection('users').doc(userId).update({
        photoURL: userRecord.photoURL,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      logger.info(`Updated Firestore user document with photo URL: ${userRecord.photoURL}`);
      
      return res.json({ 
        success: true, 
        photoURL: userRecord.photoURL,
        message: 'Successfully synced Google photo'
      });
    } catch (error) {
      logger.error(`Error updating user document: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Error updating user profile' });
    }
  } catch (error) {
    logger.error(`Error in syncGooglePhoto: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal server error syncing Google photo' });
  }
};

// Add a new controller method to proxy Google photos
exports.proxyPhoto = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL parameter is required' });
    }
    
    // Only allow proxying Google user content URLs for security
    if (!url.startsWith('https://lh3.googleusercontent.com')) {
      return res.status(403).json({ success: false, message: 'Only Google user content URLs are allowed' });
    }
    
    logger.info(`Proxying photo from: ${url}`);
    
    try {
      // Make a request to the Google URL
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          // Add a realistic user agent to avoid being blocked
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Set the content type header based on the response
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      
      // Set cache headers to improve performance
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Send the binary image data
      return res.send(response.data);
    } catch (error) {
      logger.error(`Error proxying photo: ${error.message}`);
      
      // If we can't access the photo, return a default avatar
      res.set('Content-Type', 'image/svg+xml');
      return res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <rect width="36" height="36" fill="#f0f2f5"/>
        <path d="M18 20.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5" stroke="#bec3c9" stroke-width="2" fill="none"/>
      </svg>`);
    }
  } catch (error) {
    logger.error(`Error in proxyPhoto: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Internal server error proxying photo' });
  }
};
// src/server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get a user's profile photo
router.get('/photo/:uid', profileController.getProfilePhoto);

// Sync a user's Google photo
router.post('/sync-google-photo', profileController.syncGooglePhoto);

// Proxy a Google photo to avoid CORS and access issues
router.get('/photo-proxy', profileController.proxyPhoto);

module.exports = router;
// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mailer = require('./utils/mailer');
const { initScheduler } = require('./scheduler');


// Load environment variables (only in development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('===================================');

// Initialize Express app
const app = express();

// ---- CORS Setup ----
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'https://innovet-project.vercel.app',
      'https://innovet-projects.vercel.app'
    ]; // Better fallback with production URLs

// Log CORS configuration for debugging
console.log('CORS Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS env var:', process.env.ALLOWED_ORIGINS);
console.log('Parsed allowed origins:', allowedOrigins);

// Simple and reliable CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log every request for debugging
  console.log(`CORS DEBUG: ${req.method} ${req.url} - Origin: ${origin}`);
  
  // Set CORS headers for all requests
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`CORS: Set Access-Control-Allow-Origin to ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('CORS: Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Origin:', req.headers.origin);
  next();
});

// Verify email server connection
mailer.verifyConnection().catch(err => {
  console.warn('Email verification failed, but continuing server startup:', err.message);
});

// Routes
const authRoutes = require('./routes/authRoutes');

// Add CORS debugging for auth routes
app.use('/api/auth', (req, res, next) => {
  console.log('=== AUTH ROUTE CORS DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Allowed Origins:', allowedOrigins);
  console.log('Origin Allowed:', allowedOrigins.includes(req.headers.origin));
  console.log('================================');
  next();
}, authRoutes);

// SMS routes
const smsRoutes = require('./routes/smsRoutes');
app.use('/api/sms', smsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// CORS test route
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'CORS test successful',
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin,
    corsEnabled: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      PORT: process.env.PORT
    }
  });
});

// Archive routes
const archiveRoutes = require('./routes/archiveRoutes');
app.use('/api/archives', archiveRoutes);

// Profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);



// Initialize the scheduler
initScheduler();
console.log('User archive cleanup scheduler initialized');

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;


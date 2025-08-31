// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mailer = require('./utils/mailer');
const { initScheduler } = require('./scheduler');


// Load environment variables
dotenv.config();

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('===================================');

// Initialize Express app
const app = express();

// Initialize Firebase and other services with error handling
let scheduler;

try {
  console.log('Initializing Firebase and services...');
  
  // Initialize Firebase first
  require('./config/firebase');
  console.log('Firebase initialized successfully');
  
  // Mailer is already initialized at the top of the file
  console.log('Mailer already initialized');
  
  // Initialize scheduler
  const { initScheduler } = require('./scheduler');
  scheduler = initScheduler;
  console.log('Scheduler initialized successfully');
  
} catch (error) {
  console.error('Error initializing services:', error);
  console.log('Continuing without some services...');
}

// ---- CORS Setup ----
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'https://innovet-project.vercel.app',
      'https://innovet-projects.vercel.app'
    ]; // Better fallback with production URLs

// Add additional safety check for production
if (process.env.NODE_ENV === 'production') {
  // Ensure production URLs are always included
  const productionUrls = [
    'https://innovet-project.vercel.app',
    'https://innovet-projects.vercel.app'
  ];
  
  productionUrls.forEach(url => {
    if (!allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

// Log CORS configuration for debugging
console.log('CORS Configuration:');
console.log('Environment:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS env var:', process.env.ALLOWED_ORIGINS);
console.log('Final allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile apps, Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    console.log(`CORS: Checking origin: ${origin}`);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowing origin: ${origin}`);
      return callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      console.warn(`CORS: Allowed origins are:`, allowedOrigins);
      return callback(null, false); // Don't throw error, just return false
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests globally with the same CORS configuration
app.options('*', cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, mobile apps, Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    console.log(`CORS: Checking origin: ${origin}`);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowing origin: ${origin}`);
      return callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      console.warn(`CORS: Allowed origins are:`, allowedOrigins);
      return callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// ---------------------

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Headers:', req.headers);
  next();
});

// Verify email server connection
mailer.verifyConnection().catch(err => {
  console.warn('Email verification failed, but continuing server startup:', err.message);
});

// Cleanup expired OTPs every 5 minutes
setInterval(async () => {
  try {
    await mailer.cleanupExpiredOTPs();
  } catch (error) {
    console.error('Error during OTP cleanup:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      envVar: process.env.ALLOWED_ORIGINS
    }
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  const origin = req.headers.origin;
  console.log(`Test CORS endpoint called from origin: ${origin}`);
  
  // Add explicit CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`CORS: Allowing origin: ${origin}`);
  } else if (origin) {
    // Fallback: allow the origin if it's a valid domain
    console.log(`CORS: Fallback allowing origin: ${origin}`);
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.json({
    message: 'CORS test successful',
    origin: origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// Handle OPTIONS preflight for test endpoint
app.options('/api/test-cors', (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Debug OTP status (for troubleshooting)
app.get('/api/debug/otp/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { purpose = 'verification' } = req.query;
    
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }
    
    const docRef = db.collection('otps').doc(email);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.json({ 
        email, 
        purpose, 
        exists: false, 
        message: 'No OTP found for this email' 
      });
    }
    
    const data = docSnap.data();
    const otpData = data[purpose];
    
    if (!otpData) {
      return res.json({ 
        email, 
        purpose, 
        exists: true, 
        otpData: null,
        message: `No OTP found for purpose: ${purpose}`,
        availablePurposes: Object.keys(data)
      });
    }
    
    const isExpired = Date.now() > otpData.expiry;
    
    return res.json({
      email,
      purpose,
      exists: true,
      otpData: {
        code: otpData.code,
        expiry: otpData.expiry,
        expiryDate: new Date(otpData.expiry).toISOString(),
        isExpired,
        timeRemaining: Math.max(0, otpData.expiry - Date.now()),
        timeRemainingMinutes: Math.max(0, Math.floor((otpData.expiry - Date.now()) / 60000))
      },
      currentTime: Date.now(),
      currentTimeDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in OTP debug endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Archive routes
const archiveRoutes = require('./routes/archiveRoutes');
app.use('/api/archives', archiveRoutes);

// Profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);



// Initialize the scheduler with error handling
try {
  if (scheduler) {
    scheduler();
    console.log('User archive cleanup scheduler initialized');
  } else {
    console.log('Scheduler not available, skipping initialization');
  }
} catch (error) {
  console.error('Error initializing scheduler:', error);
  console.log('Continuing without scheduler...');
}

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
